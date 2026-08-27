// components/Protos/wordpress/MetaQueryBuilder.jsx
import { Input } from "@/components/Editor/Protos/Input";
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";
import { Select } from "@/components/Editor/Protos/Select";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { Icons } from "@/components/Icons/Icons";
import { Button } from "@/components/Protos/Button";

const META_COMPARE_OPERATORS = [
  { value: "=", title: "Equal (=)" },
  { value: "!=", title: "Not Equal (!=)" },
  { value: ">", title: "Greater Than (>)" },
  { value: ">=", title: "Greater or Equal (>=)" },
  { value: "<", title: "Less Than (<)" },
  { value: "<=", title: "Less or Equal (<=)" },
  { value: "LIKE", title: "Contains (LIKE)" },
  { value: "NOT LIKE", title: "Not Contains (NOT LIKE)" },
  { value: "IN", title: "In List (IN)" },
  { value: "NOT IN", title: "Not In List (NOT IN)" },
  { value: "BETWEEN", title: "Between (BETWEEN)" },
  { value: "NOT BETWEEN", title: "Not Between" },
  { value: "EXISTS", title: "Exists (EXISTS)" },
  { value: "NOT EXISTS", title: "Not Exists (NOT EXISTS)" },
];

const META_TYPES = [
  { value: "CHAR", title: "Text (CHAR)" },
  { value: "NUMERIC", title: "Numeric" },
  { value: "DECIMAL", title: "Decimal" },
  { value: "SIGNED", title: "Signed Integer" },
  { value: "UNSIGNED", title: "Unsigned Integer" },
  { value: "DATE", title: "Date" },
  { value: "DATETIME", title: "Date & Time" },
  { value: "TIME", title: "Time" },
  { value: "BINARY", title: "Binary" },
];

// 🔥 HELPERS: Safely extract conditions and relation from the mixed object/array
const getConditions = (query) => {
  if (!query) return [];
  if (Array.isArray(query)) return query;
  return Object.keys(query)
    .filter((key) => key !== "relation")
    .map((key) => query[key]);
};

const getRelation = (query) => {
  if (!query) return "AND";
  return query.relation || "AND";
};

const buildQueryState = (conditions, relation) => {
  if (conditions.length === 0) return [];
  const newQuery = { relation };
  conditions.forEach((cond, i) => {
    newQuery[i] = cond;
  });
  return newQuery;
};

export const MetaQueryBuilder = ({ wpQuery, setWpQuery }) => {
  const metaQuery = wpQuery.meta_query;
  const conditions = getConditions(metaQuery);
  const relation = getRelation(metaQuery);

  const addCondition = () => {
    const newCondition = {
      key: "",
      value: "",
      compare: "=",
      type: "CHAR",
    };
    setWpQuery((old) => ({
      ...old,
      meta_query: buildQueryState(
        [...getConditions(old.meta_query), newCondition],
        getRelation(old.meta_query)
      ),
    }));
  };

  const updateCondition = (index, field, value) => {
    setWpQuery((old) => {
      const currentConditions = getConditions(old.meta_query);
      currentConditions[index] = { ...currentConditions[index], [field]: value };
      return {
        ...old,
        meta_query: buildQueryState(currentConditions, getRelation(old.meta_query)),
      };
    });
  };

  const removeCondition = (index) => {
    setWpQuery((old) => {
      const currentConditions = getConditions(old.meta_query);
      currentConditions.splice(index, 1);
      return {
        ...old,
        meta_query: buildQueryState(currentConditions, getRelation(old.meta_query)),
      };
    });
  };

  const updateRelation = (value) => {
    setWpQuery((old) => ({
      ...old,
      meta_query: buildQueryState(getConditions(old.meta_query), value),
    }));
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-surface-primary rounded-lg border border-border-default">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          Meta Query Conditions
        </h3>
        <Button size="sm" onClick={addCondition} variant="primary">
          + Add Condition
        </Button>
      </div>

      {conditions.length > 1 && (
        <div className="flex items-center gap-2">
          <MiniTitle className="w-fit text-xs p-3">Match</MiniTitle>
          <Select
            className="!p-[unset] flex-1"
            inputClassName="!p-3 bg-surface-tertiary text-xs"
            value={relation}
            keywords={[
              { value: "AND", title: "ALL conditions (AND)" },
              { value: "OR", title: "ANY condition (OR)" },
            ]}
            onAll={updateRelation}
          />
        </div>
      )}

      {conditions.map((condition, index) => (
        <MetaCondition
          key={index}
          condition={condition}
          index={index}
          onUpdate={updateCondition}
          onRemove={removeCondition}
        />
      ))}

      {conditions.length === 0 && (
        <p className="text-base animate-pulse text-text-primary italic text-center py-4 px-2 bg-surface-tertiary rounded-lg">
          No meta conditions. Click "Add Condition" to filter by custom fields.
        </p>
      )}
    </div>
  );
};

// Individual condition component
const MetaCondition = ({ condition, index, onUpdate, onRemove }) => {
  // 🔥 FIX: Hide value input for EXISTS / NOT EXISTS operators (WP ignores value for these)
  const hideValue = condition.compare === "EXISTS" || condition.compare === "NOT EXISTS";
  
  // Dynamic placeholder for array-based operators
  const isArrayOperator = ["IN", "NOT IN", "BETWEEN", "NOT BETWEEN"].includes(condition.compare);

  return (
    <div className="flex flex-col shrink-0 gap-5 p-3 bg-surface-tertiary rounded">
      <header className="flex items-center justify-between">
        <MiniTitle className="text-xs font-medium text-text-secondary text-white">
          Condition {index + 1}
        </MiniTitle>

        <SmallButton
          onClick={() => onRemove(index)}
          className="text-xs !w-fit !p-1 bg-[crimson] transition-all opacity-[.8] hover:opacity-100 hover:!bg-[crimson]"
          tooltipTitle="Remove condition"
          tooltipClassName="!bg-[crimson]"
        >
          {Icons.trash("white")}
        </SmallButton>
      </header>

      <div className="flex gap-2 h-full">
        <section className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-2">
            <MiniTitle className="text-xs text-text-secondary block w-fit">
              Meta Key
            </MiniTitle>
            <Input
              className="bg-surface-secondary"
              type="text"
              placeholder="_price, _sku, custom_field"
              value={condition.key || ""}
              onInput={(e) => {
                const val = e?.target ? e.target.value : e;
                onUpdate(index, "key", val);
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <MiniTitle className="text-xs text-text-secondary block w-fit">
              Compare
            </MiniTitle>
            <Select
              className="!p-[unset]"
              inputClassName="!p-3 bg-surface-secondary text-xs"
              value={condition.compare || "="}
              keywords={META_COMPARE_OPERATORS}
              onAll={(val) => onUpdate(index, "compare", val)}
            />
          </div>
        </section>

        <section className="flex flex-col gap-2 w-full">
          {!hideValue && (
            <div className="flex flex-col gap-2">
              <MiniTitle className="text-xs text-text-secondary block w-fit">
                Value {isArrayOperator ? "(comma separated)" : ""}
              </MiniTitle>
              <Input
                className="bg-surface-secondary"
                type="text"
                placeholder={isArrayOperator ? "10, 20, 30" : "100"}
                value={condition.value || ""}
                onInput={(e) => {
                  const val = e?.target ? e.target.value : e;
                  onUpdate(index, "value", val);
                }}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <MiniTitle className="text-xs text-text-secondary block w-fit">
              Type
            </MiniTitle>
            <Select
              className="!p-[unset]"
              inputClassName="!p-3 bg-surface-secondary text-xs"
              value={condition.type || "CHAR"}
              keywords={META_TYPES}
              onAll={(val) => onUpdate(index, "type", val)}
            />
          </div>
        </section>
      </div>
    </div>
  );
};