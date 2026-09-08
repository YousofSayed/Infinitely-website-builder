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
import { random, uniqueId } from "lodash";
import { uniqueID } from "@/helpers/cocktail";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { Icons } from "@/components/Icons/Icons";
import { useRecoilState } from "recoil";
import { wpCurrentConditionIdState } from "@/helpers/atoms";
import { Loader } from "@/components/Loader";
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";
import { Select } from "@/components/Editor/Protos/Select";
import { useWpUpdateOption } from "@/queries/wp.queries";

const CONDITION_OPERATORS = [
  { value: "equals", title: "Equals (==)" },
  { value: "not_equals", title: "Not Equals (!=)" },
  { value: "includes", title: "Includes (Array)" },
  { value: "not_includes", title: "Not Includes" },
  { value: "greater", title: "Greater Than (>)" },
  { value: "less", title: "Less Than (<)" },
  { value: "greater_equals", title: "Greater or Equal (>=)" },
  { value: "less_equals", title: "Less or Equal (<=)" },
  { value: "contains", title: "Contains (String)" },
  { value: "not_contains", title: "Not Contains" },
  { value: "starts_with", title: "Starts With" },
  { value: "ends_with", title: "Ends With" },
  { value: "is_empty", title: "Is Empty" },
  { value: "is_not_empty", title: "Is Not Empty" },
];

const LOGIC_OPERATORS = [
  { value: "and", title: "AND (&&)" },
  { value: "or", title: "OR (||)" },
];

// ═══════════════════════════════════════════
// DETAIL VIEW: Condition Builder
// ═══════════════════════════════════════════
const ConditionBuilder = ({
  conditions,
  setConditionsBase,
  currentConditionId,
  setCurrentConditionId,
}) => {
  const [isChanged, setIsChanged] = useState(false);

  const setConditions = useCallback(
    (updater) => {
      setIsChanged(true);
      setConditionsBase(updater);
    },
    [setConditionsBase],
  );

  useEffect(() => {
    setIsChanged(false);
  }, [currentConditionId]);

  // 🔥 FIX: Extract the nested object and the rules array correctly
  const currentData = conditions[currentConditionId] || {};
  const currentItems = currentData.conditions || []; // This is the actual array of rules
  const conditionName = currentData.inf_condition_name || "";
  const { mutateAsync: updateOption, isPending: isUpdating } =
    useWpUpdateOption();
  const handleSave = async () => {
    try {
      const tid = toast.loading(
        <ToastMsgInfo
          msg={`Saving ${conditionName || "Unnamed"} Condition...`}
        />,
      );

      const projectData = await getProjectData();
      const newConditions = {
        ...(projectData.conditions || {}),
        [currentConditionId]: currentData, // Save the whole object (name + rules)
      };

      await db.projects.update(getProjectId(), { conditions: newConditions });
      const data = await getProjectData();
      await updateOption({
        projectId: getProjectId(),
        value: data,
        optionName: "inf_config",
        merge: true,
      });
      
      setIsChanged(false);
      toast.update(tid, {
        render: (
          <ToastMsgInfo
            msg={`${conditionName || "Condition"} saved successfully 💙`}
          />
        ),
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      toast.error(<ToastMsgInfo msg="Failed to save condition 😥" />);
      console.error(error);
    }
  };

  // ─── Condition Array Helpers (Updated for nested structure) ───
  const addConditionBlock = () => {
    setConditions((old) => {
      const data = old[currentConditionId] || {};
      const items = [...(data.conditions || [])];

      if (items.length > 0) {
        items.push("and");
      }
      items.push({ var: "", operator: "equals", value: "" });

      return {
        ...old,
        [currentConditionId]: { ...data, conditions: items },
      };
    });
  };

  const updateConditionBlock = (index, field, value) => {
    setConditions((old) => {
      const data = old[currentConditionId] || {};
      const items = [...(data.conditions || [])];
      items[index] = { ...items[index], [field]: value };

      return {
        ...old,
        [currentConditionId]: { ...data, conditions: items },
      };
    });
  };

  const updateLogicBlock = (index, value) => {
    setConditions((old) => {
      const data = old[currentConditionId] || {};
      const items = [...(data.conditions || [])];
      items[index] = value;

      return {
        ...old,
        [currentConditionId]: { ...data, conditions: items },
      };
    });
  };

  const removeBlock = (index) => {
    setConditions((old) => {
      const data = old[currentConditionId] || {};
      let items = [...(data.conditions || [])];
      items.splice(index, 1);

      // Clean up orphaned logic operators
      items = items.filter((item, i) => {
        if (typeof item === "string") {
          if (i === 0) return false;
          if (typeof items[i - 1] === "string") return false;
        }
        return true;
      });

      if (items.length > 0 && typeof items[items.length - 1] === "string") {
        items.pop();
      }

      return {
        ...old,
        [currentConditionId]: { ...data, conditions: items },
      };
    });
  };

  return (
    <section className="h-full w-full max-h-full bg-surface-secondary p-2 overflow-y-auto hideScrollBar overflow-x-hidden flex flex-col gap-2">
      {/* Header / Navigation */}
      <header className="flex gap-2 sticky top-0 left-0 z-50">
        <section
          className="w-full bg-surface-tertiary p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all hover:bg-brand-primary"
          onClick={() => {
            setCurrentConditionId(null);
            setConditionsBase({});
          }}
        >
          <div className="flex items-center gap-2">
            <i className="block rotate-90">
              <Icons.arrow />
            </i>
            <h1 className="text-text-primary font-semibold capitalize select-none">
              Go To Conditions
            </h1>
          </div>

          {isChanged && (
            <span className="text-xs text-yellow-500 font-medium animate-pulse">
              ● Unsaved Changes
            </span>
          )}
        </section>

        <Button
          disabled={!isChanged}
          className="shrink-0 !px-10 font-semibold text-base justify-center"
          onClick={handleSave}
        >
          Save
        </Button>
      </header>

      {/* Condition Name */}
      <div className="flex flex-col gap-2 bg-surface-secondary rounded-lg p-2">
        <MiniTitle className="w-fit !font-medium">Condition Name</MiniTitle>
        <Input
          className="bg-surface-tertiary"
          placeholder="e.g. Admin Only, Premium Users"
          value={conditionName}
          onInput={(e) => {
            setConditions((old) => ({
              ...old,
              [currentConditionId]: {
                ...old[currentConditionId],
                inf_condition_name: e.target.value,
              },
            }));
          }}
        />
      </div>

      {/* Conditions Builder */}
      <section className="flex flex-col gap-3 p-2 bg-surface-secondary rounded-lg border border-border-default">
        <div className="flex items-center justify-between">
          <MiniTitle className="text-sm font-semibold">Logic Rules</MiniTitle>
          <Button size="sm" onClick={addConditionBlock} variant="primary">
            + Add Rule
          </Button>
        </div>

        {currentItems.length === 0 && (
          <p className="text-base animate-pulse text-text-primary italic text-center py-4 px-2 bg-surface-tertiary rounded-lg">
            No rules yet. Click "Add Rule" to create your first condition.
          </p>
        )}

        {currentItems.map((item, index) => {
          // Logic operator (AND / OR)
          if (typeof item === "string") {
            return (
              <div key={index} className="flex items-center gap-2 px-4">
                <div className="flex-1 h-px bg-border-default"></div>
                <Select
                  className="!p-[unset] w-32"
                  inputClassName="!p-2 bg-surface-tertiary text-xs text-center font-bold"
                  value={item}
                  keywords={LOGIC_OPERATORS}
                  onAll={(val) => updateLogicBlock(index, val)}
                />
                <div className="flex-1 h-px bg-border-default"></div>
              </div>
            );
          }

          // Condition object
          return (
            <div
              key={index}
              className="flex flex-col gap-3 p-3 bg-surface-tertiary rounded-lg border border-border-default"
            >
              <header className="flex items-center justify-between">
                <MiniTitle className="text-xs font-medium text-text-secondary">
                  Rule {Math.floor(index / 2) + 1}
                </MiniTitle>
                <SmallButton
                  onClick={() => removeBlock(index)}
                  className="text-xs !w-fit !p-1 bg-[crimson] transition-all opacity-[.8] hover:opacity-100 hover:!bg-[crimson]"
                  tooltipTitle="Remove rule"
                  tooltipClassName="!bg-[crimson]"
                >
                  {Icons.trash("white")}
                </SmallButton>
              </header>

              <div className="grid grid-cols-1 gap-3">
                <div
                  className="flex flex-col gap-2"
                  inf-tokens-container="true"
                >
                  <MiniTitle className="text-xs text-text-secondary w-fit">
                    Variable (Token Path)
                  </MiniTitle>
                  <Input
                    className="bg-surface-secondary"
                    type="text"
                    placeholder="e.g. user.roles, post.type, product.price"
                    value={item.var || ""}
                    onInput={(e) =>
                      updateConditionBlock(index, "var", e.target.value)
                    }
                  />
                  <small className="text-slate-200 text-[12px] italic ">
                    Use dot notation:{" "}
                    {`{{post.meta._price}}, {{user.display_name}}`}
                  </small>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <MiniTitle className="text-xs text-text-secondary w-fit">
                      Operator
                    </MiniTitle>
                    <Select
                      className="!p-[unset]"
                      inputClassName="!p-2 bg-surface-secondary text-xs"
                      value={item.operator || "equals"}
                      keywords={CONDITION_OPERATORS}
                      onAll={(val) =>
                        updateConditionBlock(index, "operator", val)
                      }
                    />
                  </div>

                  {item.operator !== "is_empty" &&
                    item.operator !== "is_not_empty" && (
                      <div className="flex flex-col gap-1">
                        <MiniTitle className="text-xs text-text-secondary w-fit">
                          Value
                        </MiniTitle>
                        <Input
                          className="bg-surface-secondary"
                          type="text"
                          placeholder="Expected value"
                          value={item.value || ""}
                          onInput={(e) =>
                            updateConditionBlock(index, "value", e.target.value)
                          }
                        />
                      </div>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* JSON Preview */}
      <div className="flex flex-col gap-2 bg-surface-secondary rounded-lg p-2">
        <MiniTitle className="w-fit !font-medium">Generated JSON</MiniTitle>
        <pre className="text-xs bg-surface-tertiary p-3 rounded-lg overflow-x-auto text-green-400 font-mono">
          {JSON.stringify(
            currentItems.filter(
              (item) =>
                typeof item === "string" ||
                (typeof item === "object" && item !== null && item.var),
            ),
            null,
            2,
          )}
        </pre>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════
// LIST VIEW: All Conditions
// ═══════════════════════════════════════════
export const WpConditionsBuilder = () => {
  const projectId = getProjectId();
  const [loading, setLoading] = useState(true);

  const conditions = useLiveQuery(async () => {
    const projectData = await getProjectData();
    setLoading(false);
    return projectData?.conditions || {};
  });

  const [newConditionName, setNewConditionName] = useState("");
  const [currentConditionId, setCurrentConditionId] = useRecoilState(
    wpCurrentConditionIdState,
  );
  const [currentConditions, setCurrentConditions] = useState({});

  const inputRef = useRef(null);

  // 🔥 FIX: Pass the entire object (name + id + rules array) to local state
  useEffect(() => {
    if (currentConditionId && conditions && conditions[currentConditionId]) {
      setCurrentConditions({
        [currentConditionId]: conditions[currentConditionId],
      });
    }
  }, [currentConditionId, conditions]);

  const addNewCondition = async () => {
    if (!newConditionName.trim()) {
      toast.error(<ToastMsgInfo msg="Please enter a condition name" />);
      return;
    }

    const tid = toast.loading(<ToastMsgInfo msg="Adding new condition..." />);
    const uuid = uniqueId(`iNWPCOND${uniqueID()}-${random(999, 10000)}`);

    const newConditionData = {
      inf_condition_name: newConditionName,
      inf_condition_id: uuid,
      conditions: [], // Empty rules array
    };

    await db.projects.update(+projectId, {
      conditions: {
        ...(conditions || {}),
        [uuid]: newConditionData,
      },
    });

    setNewConditionName("");
    toast.done(tid);
    toast.success(<ToastMsgInfo msg="Condition added successfully 💙" />);
  };

  const removeCondition = async (conditionId) => {
    const cnf = confirm("Are you sure you want to remove this condition?");
    if (!cnf) return;

    const tid = toast.loading(<ToastMsgInfo msg="Removing condition..." />);
    await db.projects.update(+projectId, {
      conditions: Object.fromEntries(
        Object.entries(conditions || {}).filter(([id]) => id !== conditionId),
      ),
    });
    toast.done(tid);
    toast.success(<ToastMsgInfo msg="Condition removed successfully 💙" />);
  };

  const exportCondition = async (conditionId) => {
    const tid = toast.loading(<ToastMsgInfo msg="Exporting condition..." />);
    const cond = conditions[conditionId];
    downloadFile({
      content: JSON.stringify(cond, null, 2),
      filename: `${cond.inf_condition_name || "condition"}.json`,
    });
    toast.done(tid);
    toast.success(<ToastMsgInfo msg="Condition exported successfully 💙" />);
  };

  const upload = async () => {
    if (!inputRef.current?.files?.length) return;
    inputRef.current.value = null;

    const tid = toast.loading(<ToastMsgInfo msg="Uploading condition..." />);
    try {
      const file = inputRef.current.files[0];
      const data = await file.text();
      const parsed = JSON.parse(data);

      const uuid =
        parsed.inf_condition_id ||
        uniqueId(`iNWPCOND${uniqueID()}-${random(999, 10000)}`);

      await db.projects.update(+projectId, {
        conditions: {
          ...(conditions || {}),
          [uuid]: parsed,
        },
      });

      toast.done(tid);
      toast.success(<ToastMsgInfo msg="Condition uploaded successfully 💙" />);
    } catch (error) {
      toast.dismiss(tid);
      toast.error(<ToastMsgInfo msg="Invalid JSON file 😥" />);
    }
  };

  if (currentConditionId) {
    return (
      <ConditionBuilder
        conditions={currentConditions}
        setConditionsBase={setCurrentConditions}
        currentConditionId={currentConditionId}
        setCurrentConditionId={setCurrentConditionId}
      />
    );
  }

  return (
    <main className="w-full h-full max-h-full overflow-y-auto hideScrollBar flex flex-col gap-2 p-2 bg-surface-secondary animate-to-go">
      <ShowIf condition={Object.keys(conditions || {}).length > 0 && !loading}>
        {() => (
          <nav className="flex flex-col gap-2 w-full h-full animate-to-go">
            {Object.entries(conditions || {}).map(
              ([conditionId, condition]) => (
                <section
                  key={conditionId}
                  className="
                  group cursor-pointer flex items-center justify-between gap-2
                  bg-surface-tertiary !p-2 transition-all rounded-lg
                  hover:bg-brand-primary
                  has-[.action-area:hover]:bg-surface-tertiary
                "
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setCurrentConditionId(conditionId);
                    // 🔥 FIX: Pass the whole object to local state
                    setCurrentConditions({ [conditionId]: condition });
                  }}
                >
                  <h1 className="text-white capitalize font-semibold text-lg pointer-events-none">
                    {condition?.inf_condition_name || "Unnamed Condition"}
                  </h1>

                  <section className="flex items-center gap-3">
                    <div className="action-area flex gap-2 bg-surface-secondary p-1 rounded-lg">
                      <SmallButton
                        className="shrink-0 !p-1.5 w-fit"
                        tooltipTitle="Copy Condition Id"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(conditionId);
                          toast.success(<ToastMsgInfo msg="ID copied!" />);
                        }}
                      >
                        <Icons.copy fill="white" height={18} width={18} />
                      </SmallButton>

                      <SmallButton
                        className="shrink-0 !p-1.5 w-fit"
                        tooltipTitle="Export Condition"
                        onClick={(e) => {
                          e.stopPropagation();
                          exportCondition(conditionId);
                        }}
                      >
                        {Icons.export("white", undefined, 18, 18)}
                      </SmallButton>

                      <SmallButton
                        className="shrink-0 !p-1.5 w-fit hover:!bg-[crimson]"
                        tooltipTitle="Delete Condition"
                        tooltipClassName="!bg-[crimson]"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCondition(conditionId);
                        }}
                      >
                        <Icons.delete />
                      </SmallButton>
                    </div>

                    <i className="arrow -rotate-90 cursor-pointer block">
                      <Icons.arrow />
                    </i>
                  </section>
                </section>
              ),
            )}
          </nav>
        )}
      </ShowIf>

      <ShowIf
        condition={Object.keys(conditions || {}).length === 0 && !loading}
      >
        <section className="flex flex-col items-center justify-center gap-4 h-full rounded-lg animate-to-go px-5">
          <h1 className="text-2xl font-bold animate-pulse text-slate-200">
            No conditions found
          </h1>
          <section className="flex gap-2 w-full">
            <Input
              placeholder="Condition name"
              value={newConditionName}
              onInput={(e) => setNewConditionName(e.target.value)}
              className="text-center bg-surface-tertiary w-full"
              onKeyUp={(e) => e.key === "Enter" && addNewCondition()}
            />
            <SmallButton onClick={() => inputRef.current?.click()}>
              <Icons.upload width="20" height="20" strokeColor="white" />
            </SmallButton>
            <input
              type="file"
              hidden
              ref={inputRef}
              accept=".json"
              onChange={upload}
            />
          </section>
          <Button
            className="text-white justify-center font-semibold bg-surface-tertiary hover:bg-brand-primary transition-colors w-full "
            onClick={addNewCondition}
          >
            Add Condition
          </Button>
        </section>
      </ShowIf>

      <ShowIf condition={loading}>
        <Loader />
      </ShowIf>
    </main>
  );
};
