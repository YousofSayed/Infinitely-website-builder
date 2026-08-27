import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Input } from "@/components/Editor/Protos/Input";
import { Select } from "@/components/Editor/Protos/Select";
import { Loader } from "@/components/Loader";
import { ShowIf } from "@/components/ShowIf";
import { grouped_wp_settings } from "@/constants/wp_settings";
import {
  useUpdateWpSettingsMutation,
  useWpSettings,
} from "@/queries/wp.queries";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/Protos/Button";
import { Accordion } from "@/components/Protos/Accordion";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { advancedSearchSuggestions, getProjectId } from "@/helpers/functions";
import { AccordionItem } from "@/components/Protos/AccordionItem";
import { SearchHeader } from "@/components/Protos/SearchHeader";
import { groupArrayAsObject } from "@/helpers/bridge";
import { cloneDeep } from "lodash";
console.log("grouped_wp_settings", grouped_wp_settings);

const FlexColSetting = ({ children }) => (
  <section className="flex flex-col gap-2 p-2 bg-surface-secondary rounded-lg">
    {children}
  </section>
);

export const WpSettings = () => {
  const {
    data: wpSettingsData,
    isPending: isWpSettingsLoading,
    isRefetching: isRefetchingWpSettings,
  } = useWpSettings();
  const { mutateAsync: updateWpSettings, isPending: isUpdatingWpSettings } =
    useUpdateWpSettingsMutation();
  const qc = useQueryClient();
  const [groupedSettings, setGroupedSettings] = useState(
    cloneDeep(grouped_wp_settings),
  );

  // ✅ FIX 1: Use local state for INSTANT UI updates.
  // This guarantees the UI updates immediately, regardless of React Query cache delays.
  const [localSettings, setLocalSettings] = useState({});

  // Sync React Query data to local state exactly once when it loads
  useEffect(() => {
    if (wpSettingsData?.settings) {
      setLocalSettings(wpSettingsData.settings);
    }
  }, [wpSettingsData]);

  // Helper to update BOTH local state and RQ cache simultaneously
  const updateSetting = (key, value) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));

    // Keep RQ cache in sync in the background
    qc.setQueryData(["wp_settings"], (oldData) => ({
      ...oldData,
      settings: { ...(oldData?.settings || {}), [key]: value },
    }));
  };

  // Helper for custom components that use the (old => newState) updater pattern
  const updateSettingsObject = (updater) => {
    setLocalSettings((prev) => {
      const newState = updater(prev);
      qc.setQueryData(["wp_settings"], (oldData) => ({
        ...oldData,
        settings: newState,
      }));
      return newState;
    });
  };

  const saveSettings = async () => {
    const tid = toast.loading(<ToastMsgInfo msg="Saving..." />);
    await updateWpSettings(
      {
        projectId: getProjectId(),
        settings: localSettings,
      },
      {
        onSuccess() {
          toast.done(tid);
          toast.success(
            <ToastMsgInfo msg="WordPress Settings saved successfully 💙" />,
          );
        },
        onError(error) {
          toast.dismiss(tid);
          toast.error(
            <ToastMsgInfo msg="Failed to save WordPress Settings 😥" />,
          );
          console.error(error);
          throw error;
        },
      },
    );
  };

  const search = (value) => {
    if (!value) {
      setGroupedSettings(cloneDeep(grouped_wp_settings));
      return;
    }
    const vals = Object.values(cloneDeep(grouped_wp_settings)).flat();
    // console.log("searchVals" , vals);
    const searchVals = advancedSearchSuggestions(vals, value.trim(), false, [
      "key",
      "group",
      "title",
    ]);

    const searchedSettings = groupArrayAsObject(searchVals, "group");
    console.log("searchVals", searchVals, value, searchedSettings);
    setGroupedSettings(searchedSettings);
  };

  return (
    <main className="w-full h-full min-h-full bg-surface-secondary flex flex-col gap-2 p-2 overflow-y-auto hideScrollBar">
      <SearchHeader
        search={search}
        allowTimeout={false}
        showReloadIcon
        isReload={
          isUpdatingWpSettings || isRefetchingWpSettings || isWpSettingsLoading
        }
      />

      <ShowIf condition={!isWpSettingsLoading}>
        <section className="w-full  shrink-0 grow-0   flex flex-col gap-2  rounded-lg   animate-go-to">
          <Accordion>
            {Object.entries(groupedSettings).map(([key, value], i) => (
              <AccordionItem label={key} title={key} key={i}>
                <section className="flex flex-col gap-2" key={i}>
                  {/* <h1 className="p-2 bg-brand-primary rounded-lg text-center text-lg capitalize text-white font-semibold">
              {key}
            </h1> */}

                  <section className="flex flex-col gap-2">
                    {value.map((item, x) => (
                      <FlexColSetting key={x}>
                        <FitTitle>{item.title}</FitTitle>

                        <ShowIf
                          condition={
                            item.componentType === "input" && !item.dynamic
                          }
                        >
                          <Input
                            className="bg-surface-tertiary"
                            type={item?.inputType || "text"}
                            min={item.min}
                            max={item.max}
                            placeholder={item.placeholder ?? item?.title}
                            // ✅ Use localSettings instead of wpSettingsData
                            value={localSettings[item.key] ?? ""}
                            onInput={(ev) => {
                              // Safe fallback whether Input passes an event or a raw value
                              const val = ev?.target ? ev.target.value : ev;
                              updateSetting(item.key, val);
                            }}
                          />
                        </ShowIf>

                        <ShowIf
                          condition={
                            item.componentType === "select" && !item.dynamic
                          }
                        >
                          <Select
                            className="!p-[unset] "
                            inputClassName="!p-3 bg-surface-tertiary"
                            placeholder={item?.placeholder ?? item?.title}
                            // ✅ Use localSettings instead of wpSettingsData
                            value={localSettings[item.key] ?? ""}
                            keywords={item?.keywords}
                            // ✅ FIX 2: onAll passes the VALUE directly, NOT an event object!
                            onAll={(val) => {
                              updateSetting(item.key, val);
                            }}
                          />
                        </ShowIf>

                        <ShowIf condition={item.dynamic && item.Component}>
                          <item.Component
                            keyItem={item.key}
                            // ✅ Use localSettings instead of wpSettingsData
                            value={localSettings[item.key]}
                            setValue={(updater) => {
                              updateSettingsObject(updater);
                            }}
                          />
                        </ShowIf>
                      </FlexColSetting>
                    ))}
                  </section>
                </section>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
        <Button
          className=" w-full font-semibold text-center justify-center items-center "
          disabled={
            isUpdatingWpSettings ||
            isRefetchingWpSettings ||
            isWpSettingsLoading
          }
          onClick={async () => {
            await saveSettings();
          }}
        >
          Save
        </Button>
      </ShowIf>

      <ShowIf condition={isWpSettingsLoading}>
        <Loader />
      </ShowIf>
    </main>
  );
};
