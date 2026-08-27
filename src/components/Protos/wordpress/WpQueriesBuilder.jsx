import { ShowIf } from "@/components/ShowIf";
import {
  downloadFile,
  getProjectData,
  getProjectId,
} from "@/helpers/functions";
import { useLiveQuery } from "dexie-react-hooks";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Protos/Button";
import { Input } from "@/components/Editor/Protos/Input";
import { db } from "@/helpers/db";
import { isArray, random, uniqueId } from "lodash";
import { uniqueID } from "@/helpers/cocktail";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { Icons } from "@/components/Icons/Icons";
import { useRecoilState } from "recoil";
import { wpCurrentQueryIdState, wpQueryState } from "@/helpers/atoms";
import { Loader } from "@/components/Loader";
import { grouped_wp_query } from "@/constants/wp_query";
import { Accordion } from "../Accordion";
import { AccordionItem } from "../AccordionItem";
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";
import { Select } from "@/components/Editor/Protos/Select";
import { UniversalDynamicQuerySelect } from "./UniversalDynamicQuerySelect";
import { Choices } from "@/components/Editor/Protos/Choices";
import { useWpUpdateOption } from "@/queries/wp.queries";

const QueryBuilder = () => {
  const [currentQueryId, setCurrentQueryId] = useRecoilState(
    wpCurrentQueryIdState,
  );
  const [wpQuery, setWpQueryBase] = useRecoilState(wpQueryState);
  const [isChanged, setIsChanged] = useState(false);
  const { mutateAsync: updateWpOption, isPending: isUpdatingWpOption } =
    useWpUpdateOption();

  // 🔥 1. WRAPPER: Intercepts all state updates to track changes
  const setWpQuery = useCallback(
    (updater) => {
      setIsChanged(true);
      setWpQueryBase(updater);
    },
    [setWpQueryBase],
  );

  // 🔥 2. RESET: Clear the changed flag when switching to a different query
  useEffect(() => {
    setIsChanged(false);
  }, [currentQueryId]);

  // 🔥 3. SAVE HANDLER: Call this when the user clicks "Save"
  const handleSave = async () => {
    // ... your save to DB logic here ...c
    try {
      const tid = toast.loading(
        <ToastMsgInfo msg={`Saving ${wpQuery.inf_query_name} Query...`} />,
      );
      const projectData = await getProjectData();
      const newQueries = {
        ...((await projectData).queries || {}),
        [currentQueryId]: wpQuery,
      };
      projectData.queries = newQueries;
      await db.projects.update(getProjectId(), { queries: newQueries });
      await updateWpOption({
        optionName: "inf_config",
        projectId: getProjectId(),
        value: projectData,
        merge: true,
      });
      setIsChanged(false); // Reset flag after successful save
      toast.update(tid, {
        render: (
          <ToastMsgInfo
            msg={`${wpQuery.inf_query_name} Query saved successfully 💙`}
          />
        ),
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      
    } catch (error) {
      toast.dismiss(tid);
      toast.error(
        <ToastMsgInfo
          msg={`Failed to save ${wpQuery.inf_query_name} Query 😥`}
        />,
      );
      console.error(error);
      throw error;
    }
  };

  return (
    <section className="h-full w-full max-h-full overflow-y-auto hideScrollBar overflow-x-hidden flex flex-col gap-2">
      {/* Header / Navigation */}
      <header className="flex gap-2 sticky top-0 left-0 z-50">
        <section
          className="w-full bg-surface-tertiary p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all hover:bg-brand-primary"
          onClick={() => {
            setCurrentQueryId(null);
            // Use base setter here so navigating away doesn't trigger "unsaved changes"
            setWpQueryBase({});
          }}
        >
          <div className="flex items-center gap-2">
            <i className="block rotate-90">
              <Icons.arrow />
            </i>
            <h1 className="text-text-primary font-semibold capitalize select-none">
              Go To Queries
            </h1>
          </div>

          {/* 🔥 Visual indicator for unsaved changes */}
          {isChanged && (
            <span className="text-xs text-yellow-500 font-medium animate-pulse">
              ● Unsaved Changes
            </span>
          )}
        </section>

        <Button
          disabled={!isChanged || isUpdatingWpOption}
          className="shrink-0 !px-10 font-semibold text-base justify-center"
          onClick={handleSave}
        >
          Save
        </Button>
      </header>

      {/* Settings Accordion */}
      <Accordion>
        {Object.entries(grouped_wp_query).map(([group, qs]) => (
          <AccordionItem key={group} label={group}>
            <section className="flex flex-col gap-2">
              {qs.map((q, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2 p-2 rounded-lg bg-surface-secondary"
                >
                  <MiniTitle className={"w-fit !font-medium"}>
                    {q.title}
                  </MiniTitle>

                  {/* 🔥 FIX: Standardized wpQuery[q.key] across all inputs */}
                  <ShowIf condition={q.componentType === "input" && !q.dynamic}>
                    <Input
                      className="bg-surface-tertiary"
                      title={q.title}
                      placeholder={q.placeholder}
                      {...(q.inputType === "number" && {
                        type: "number",
                        min: q?.min,
                        max: q?.max,
                      })}
                      value={wpQuery[q.key] ?? ""}
                      onChange={(e) => {
                        // Use functional updater to prevent stale state bugs
                        setWpQuery((old) => ({
                          ...old,
                          [q.key]: e.target.value,
                        }));
                      }}
                    />
                  </ShowIf>

                  <ShowIf
                    condition={q.componentType === "select" && !q.dynamic}
                  >
                    <Select
                      className="!p-[unset]"
                      inputClassName="!p-3 bg-surface-tertiary"
                      placeholder={q.placeholder ?? q.title}
                      value={wpQuery[q.key] ?? ""}
                      keywords={q.keywords}
                      onAll={(value) => {
                        setWpQuery((old) => {
                          if (q.multiple) {
                            let currentArr = old[q.key];
                            if (!isArray(currentArr))
                              currentArr = currentArr ? [currentArr] : [];
                            return {
                              ...old,
                              [q.key]: [...new Set([...currentArr, value])],
                            };
                          }
                          return { ...old, [q.key]: value };
                        });
                      }}
                    />
                  </ShowIf>

                  <ShowIf condition={q.resource && q.dynamic}>
                    <UniversalDynamicQuerySelect
                      setting={q}
                      wpQuery={wpQuery}
                      setWpQuery={setWpQuery} // 🔥 Passes the wrapper
                    />
                  </ShowIf>

                  {/* 🔥 FIX: Added proper array checking and functional updater */}
                  <ShowIf
                    condition={
                      q.multiple &&
                      isArray(wpQuery[q.key]) &&
                      wpQuery[q.key].length > 0
                    }
                  >
                    <section className="flex flex-wrap gap-2 p-1 rounded-lg bg-surface-tertiary overflow-x-auto hideScroll">
                      <Choices
                        className="flex-wrap !p-0.5"
                        keywordClassName="!py-1 !px-2 !text-base"
                        keywords={wpQuery[q.key]}
                        onCloseClick={(e, keyword, index) => {
                          setWpQuery((old) => ({
                            ...old,
                            [q.key]: old[q.key]?.filter?.((v) => v !== keyword),
                          }));
                        }}
                      />
                    </section>
                  </ShowIf>

                  {q.componentType === "custom" && q.Component && (
                    <q.Component wpQuery={wpQuery} setWpQuery={setWpQuery} /> // 🔥 Passes the wrapper
                  )}
                </div>
              ))}
            </section>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
export const WpQueriesBuilder = () => {
  const projectId = getProjectId();
  const [loading, setLoading] = useState(true);
  const queries = useLiveQuery(async () => {
    const qs = await (await getProjectData()).queries;
    setLoading(false);
    return qs;
  });
  const [newQueryName, setNewQueryName] = useState("");
  const [currentQueryId, setCurrentQueryId] = useRecoilState(
    wpCurrentQueryIdState,
  );
  const [wpQuery, setWpQuery] = useRecoilState(wpQueryState);

  const inputRef = useRef(/** @type {HTMLInputElement} */ (null));

  const addNewQuery = async () => {
    const tid = toast.loading(<ToastMsgInfo msg="Adding new query..." />);
    const uuid = uniqueId(`iNFWPQUERY${uniqueID()}-${random(999, 10000)}`);
    await db.projects.update(+projectId, {
      queries: {
        ...queries,
        [uuid]: {
          inf_query_name: newQueryName,
          inf_query_id: uuid,
        },
      },
    });
    toast.done(tid);
    toast.success(<ToastMsgInfo msg="Query added successfully 💙" />);
  };

  const removeQuery = async (queryId) => {
    const cnf = confirm("Are you sure you want to remove this query?");
    if (!cnf) return;
    const tid = toast.loading(<ToastMsgInfo msg="Removing query..." />);
    await db.projects.update(+projectId, {
      queries: Object.fromEntries(
        Object.entries(queries).filter(([id]) => id !== queryId),
      ),
    });
    toast.done(tid);
    toast.success(<ToastMsgInfo msg="Query removed successfully 💙" />);
  };

  const exportQuery = async (queryId) => {
    const tid = toast.loading(<ToastMsgInfo msg="Exporting query..." />);
    downloadFile({
      content: JSON.stringify(queries[queryId]),
      filename: `${queries[queryId].inf_query_name}.json`,
    });
    toast.done(tid);
    toast.success(<ToastMsgInfo msg="Query exported successfully 💙" />);
  };

  const upload = async () => {
    if (!inputRef.current.files.length) return;
    inputRef.current.value = null;
    const tid = toast.loading(<ToastMsgInfo msg="Uploading query..." />);
    const file = inputRef.current.files[0];
    const data = await file.text();
    const parsed = JSON.parse(data);
    await db.projects.update(+projectId, {
      queries: {
        ...queries,
        [parsed.inf_query_id]: parsed,
      },
    });
    toast.done(tid);
    toast.success(<ToastMsgInfo msg="Query uploaded successfully 💙" />);
  };

  //   useEffect(() => {
  //     return () => {
  //       setCurrentQueryId(null);
  //       setWpQuery({});
  //     };
  //   }, []);

  return (
    <main className="w-full h-full  max-h-full overflow-y-auto hideScrollBar  flex flex-col gap-2 p-2 bg-surface-secondary animate-to-go">
      <ShowIf
        condition={
          Object.keys(queries ?? {}).length > 0 && !currentQueryId && !loading
        }
      >
        {() => (
          <nav className="flex flex-col gap-2 w-full h-full  animate-to-go">
            {Object.entries(queries).map(([queryId, query]) => (
              <section
                key={query?.id ?? query?.inf_query_name}
                className="
                        group
                        cursor-pointer flex items-center justify-between gap-2
                        bg-surface-tertiary !p-2 transition-all rounded-lg
                        hover:bg-brand-primary
                        has-[.action-area:hover]:bg-surface-tertiary
                    "
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setCurrentQueryId(queryId);
                  setWpQuery(query);
                }}
              >
                <h1 className="text-white capitalize font-semibold text-lg pointer-events-none">
                  {query?.inf_query_name}
                </h1>

                <section className="flex items-center gap-3">
                  <div className="action-area flex gap-2 bg-surface-secondary p-1 rounded-lg">
                    <SmallButton
                      className="shrink-0 !p-1.5 w-fit"
                      tooltipTitle="Copy Query Id"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(
                          query?.id ?? query?.inf_query_name,
                        );
                      }}
                    >
                      <Icons.copy fill="white" height={18} width={18} />
                    </SmallButton>

                    <SmallButton
                      className="shrink-0 !p-1.5 w-fit"
                      tooltipTitle="Export Query"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportQuery(queryId);
                      }}
                    >
                      {Icons.export("white", undefined, 18, 18)}
                    </SmallButton>

                    <SmallButton
                      className="shrink-0 !p-1.5 w-fit hover:!bg-[crimson]"
                      tooltipTitle="Delete Query"
                      tooltipClassName="!bg-[crimson]"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuery(queryId);
                      }}
                    >
                      <Icons.delete />
                    </SmallButton>
                  </div>

                  <i
                    className="arrow -rotate-90 cursor-pointer block"
                    // onClick={() => {
                    //   setCurrentQueryId(queryId);
                    // }}
                  >
                    <Icons.arrow />
                  </i>
                </section>
              </section>
            ))}
          </nav>
        )}
      </ShowIf>

      <ShowIf
        condition={
          !Object.keys(queries ?? {}).length && !currentQueryId && !loading
        }
      >
        <section className="flex flex-col items-center justify-center gap-4 h-full   rounded-lg animate-to-go">
          <h1 className="text-2xl font-bold  animate-pulse text-slate-200">
            No queries found
          </h1>
          <section className="flex gap-2">
            <Input
              placeholder="Query name"
              value={newQueryName}
              onInput={(e) => setNewQueryName(e.target.value)}
              className="text-center bg-surface-tertiary w-[min(300px,90%)]"
            />
            <SmallButton onClick={() => inputRef.current.click()}>
              <Icons.upload width="20" height="20" strokeColor="white" />
            </SmallButton>

            <input type="file" hidden ref={inputRef} onChange={upload} />
          </section>
          <Button
            className="text-white bg-surface-tertiary hover:bg-brand-primary transition-colors"
            onClick={addNewQuery}
          >
            Add query
          </Button>
        </section>
      </ShowIf>

      <ShowIf condition={loading && !currentQueryId}>
        <Loader />
      </ShowIf>

      <ShowIf condition={Boolean(currentQueryId)}>
        <QueryBuilder />
      </ShowIf>
    </main>
  );
};
