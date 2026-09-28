import { ContentEditable } from "@/components/Editor/Protos/ContentEditable";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Input } from "@/components/Editor/Protos/Input";
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";
import { Select } from "@/components/Editor/Protos/Select";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { Icons } from "@/components/Icons/Icons";
import { Button } from "@/components/Protos/Button";
import { OptionsButton } from "@/components/Protos/OptionsButton";
import { SwitchButton } from "@/components/Protos/SwitchButton";
import { ShowIf } from "@/components/ShowIf";
import { LLM_PROVIDERS } from "@/constants/shared";
import { db } from "@/helpers/db";
import {
  addAIProviderAPIKey,
  getAIProviderAPIKey,
  getProjectData,
  getProjectId,
} from "@/helpers/functions";
import { useBusyCallback } from "@/hooks/useBusyCallback";
import { useLiveQuery } from "dexie-react-hooks";
import React, { useState } from "react";
import { toast } from "react-toastify";

export const Prefrences = () => {
  const [providerData, setProviderData] = useState({
    name: "",
    api_key: "",
  });
  const projectId = getProjectId();
  const [providers, setProviders] = useState([]);
  const [showEdite, setShowEdite] = useState(false);
  const [defaultProvider, setDefaultProvider] = useState();
  const [maxTokens, setMaxTokens] = useState();

  useLiveQuery(async () => {
    const projectData = await getProjectData();
    setProviders(Object.keys(projectData?.aiSettings?.providers ?? {}));
    setDefaultProvider(projectData?.aiSettings?.defaultProvider);
    setMaxTokens(projectData?.aiSettings?.max_tokens);
  });

  const [addProvider, { isLoading: isAddingProvider }] = useBusyCallback(
    async () => {
      console.log(providerData);

      if (!providerData.name)
        return toast.error(
          <ToastMsgInfo msg={`Please fill all the fields 😣`} />,
        );
      if (
        !providerData.name.toLowerCase() !== "ollama" &&
        !providerData.api_key
      )
        return toast.error(
          <ToastMsgInfo msg={`Please fill all the fields 😣`} />,
        );
      addAIProviderAPIKey({
        provider: providerData.name,
        api_key: providerData.api_key,
      });

      const projectData = await getProjectData();

      await db.projects.update(projectId, {
        aiSettings: {
          ...(projectData?.aiSettings || {}),
          providers: {
            ...(projectData?.aiSettings?.providers || {}),
            [providerData.name]: "api_key_added_to_local_storage",
          },
        },
      });

      setProviderData({});
      toast.success(<ToastMsgInfo msg={`Provider added successfully 😉`} />);
    },
  );

  const [deleteProvider, { isLoading: isdeletingProvider }] = useBusyCallback(
    async (provider) => {
      const projectData = await getProjectData();

      projectData?.aiSettings?.providers?.[provider] &&
        delete projectData.aiSettings.providers[provider];

      await db.projects.update(projectId, {
        aiSettings: {
          ...(projectData?.aiSettings || {}),
        },
      });

      setProviderData({});
      toast.success(<ToastMsgInfo msg={`Provider deleted successfully 😉`} />);
    },
  );

  const [setDefaultProviderInDb, { isLoading: isSettingDefault }] =
    useBusyCallback(async (provider) => {
      const projectData = await getProjectData();
      await db.projects.update(projectId, {
        aiSettings: {
          ...(projectData?.aiSettings || {}),
          defaultProvider: provider,
        },
      });
    });

  const [setMaxTokensInDb, { isLoading: isSettingMaxTokens }] = useBusyCallback(
    async (tokens) => {
      const projectData = await getProjectData();
      await db.projects.update(projectId, {
        aiSettings: {
          ...(projectData?.aiSettings || {}),
          max_tokens: tokens,
        },
      });
    },
  );

  return (
    <section className="p-1 flex flex-col gap-3 auto-animate">
      <header className="flex flex-col gap-2 p-1 bg-surface-tertiary rounded-lg auto-animate">
        <MiniTitle>Add provider API Keys</MiniTitle>
        <Select
          inputClassName="!p-3 bg-surface-secondary text-center"
          containerClassName="!p-0 !bg-red-900"
          className="!p-0"
          keywords={LLM_PROVIDERS}
          placeholder="Choose provider"
          value={providerData.name}
          onAll={(value) => {
            setProviderData({
              ...providerData,
              name: value,
            });
          }}
        />
        <Input
          className="!p-2 bg-surface-secondary text-center"
          placeholder="API Key"
          value={providerData.api_key}
          onInput={(e) => {
            setProviderData({ ...providerData, api_key: e.target.value });
          }}
        />
        <Button
          className="text-center justify-center font-medium bg-surface-secondary hover:bg-brand-primary transition-colors"
          disabled={isAddingProvider}
          onClick={addProvider}
        >
          Add
        </Button>
      </header>

      <ShowIf condition={providers?.length}>
        {() => (
          <main className="flex flex-col gap-2   auto-animate">
            <section className="flex flex-col gap-2 p-1 bg-surface-tertiary rounded-lg auto-animate">
              <MiniTitle>Providers</MiniTitle>

              {providers.map((provider) => (
                <div key={provider} className="flex flex-col gap-2">
                  <section className="flex items-center justify-between auto-animate">
                    <FitTitle>{provider}</FitTitle>

                    <OptionsButton>
                      <div className="flex flex-col gap-2">
                        <SmallButton
                          disabled={isdeletingProvider}
                          className="p-1 w-full aspect-square  hover:!bg-[crimson] "
                          tooltipTitle="Delete provider"
                          tooltipClassName="!bg-[crimson]"
                          onClick={() => deleteProvider(provider)}
                        >
                          {Icons.trash("white", 2)}
                        </SmallButton>

                        <SmallButton
                          className="p-1 w-full aspect-square  "
                          tooltipTitle="Edite API key"
                          onClick={(e) => {
                            setShowEdite(provider);
                          }}
                        >
                          <Icons.edite fill="white" width={18} height={18} />
                        </SmallButton>

                        <SmallButton
                          className="p-1 w-full aspect-square  "
                          tooltipTitle="Copy API key"
                          onClick={async (e) => {
                            await navigator.clipboard.writeText(
                              getAIProviderAPIKey({ provider }),
                            );
                            toast.success(
                              <ToastMsgInfo msg={`Copied to clipboard 😉`} />,
                            );
                          }}
                        >
                          <Icons.copy fill="white" width={18} height={18} />
                        </SmallButton>
                      </div>
                    </OptionsButton>
                  </section>

                  <ShowIf condition={provider !== "ollama"}>
                    <div className="p-2 bg-surface-secondary rounded-lg">
                      <ContentEditable
                        showInput={provider === showEdite}
                        setShowInput={setShowEdite}
                        value={getAIProviderAPIKey({ provider })}
                        onInput={(e) => {
                          addAIProviderAPIKey({
                            provider,
                            api_key: e.target.value,
                          });
                        }}
                      >
                        <h1 className="text-nowrap overflow-hidden text-ellipsis font-medium text-slate-300">
                          {getAIProviderAPIKey({ provider }) || "Enter API Key"}
                        </h1>
                      </ContentEditable>
                    </div>
                  </ShowIf>

                  <section className="flex items-center justify-between p-2 bg-surface-secondary rounded-lg ">
                    <h1 className="text-text-primary font-medium">
                      Set as default
                    </h1>
                    <SwitchButton
                      defaultValue={defaultProvider === provider}
                      onSwitch={async (value) => {
                        value
                          ? setDefaultProviderInDb(provider)
                          : setDefaultProviderInDb("");
                      }}
                    />
                  </section>
                </div>
              ))}
            </section>

            {/* <section className="flex flex-col gap-2 p-1 bg-surface-tertiary rounded-lg auto-animate">
              <FitTitle>Max tokens</FitTitle>
              <Input
                type="number"
                className="!p-2 bg-surface-secondary "
                placeholder="Max tokens"
                value={maxTokens}
                onInput={(e) => {
                  setMaxTokensInDb((e.target.value));
                }}
              />
          </section> */}
          </main>
        )}
      </ShowIf>
    </section>
  );
};
