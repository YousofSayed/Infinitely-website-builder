// components/Protos/wordpress/TaxQueryBuilder.jsx
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";
import { Select } from "@/components/Editor/Protos/Select";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { Icons } from "@/components/Icons/Icons";
import { Button } from "@/components/Protos/Button";
import { useWpAllTaxonomies, useWpAllTerms } from "@/queries/wp.queries";
import { useMemo } from "react";

// Static — WordPress only supports these 4 field values in tax_query
const TAX_FIELDS = [
  { value: "term_id", title: "Term ID" },
  { value: "slug", title: "Slug" },
  { value: "name", title: "Name" },
  { value: "term_taxonomy_id", title: "Term Taxonomy ID" },
];

const TAX_OPERATORS = [
  { value: "IN", title: "Include (IN)" },
  { value: "NOT IN", title: "Exclude (NOT IN)" },
  { value: "AND", title: "All must match (AND)" },
  { value: "EXISTS", title: "Has any term (EXISTS)" },
  { value: "NOT EXISTS", title: "Has no terms (NOT EXISTS)" },
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

export const TaxQueryBuilder = ({ wpQuery, setWpQuery }) => {
  const taxQuery = wpQuery.tax_query;
  const conditions = getConditions(taxQuery);
  const relation = getRelation(taxQuery);

  // 🔥 DYNAMIC: Fetch taxonomies based on selected post_type
  const selectedTypes = Array.isArray(wpQuery.post_type)
    ? wpQuery.post_type
    : [wpQuery.post_type || "post"];

  const { data: taxonomiesResponse, isPending: isTaxonomiesLoading  , isRefetching : isTaxonomiesRefetching} = useWpAllTaxonomies({
    post_type: selectedTypes.includes("any") ? [] : selectedTypes,
  });

  const availableTaxonomies = useMemo(() => {
    if (!taxonomiesResponse?.success || !taxonomiesResponse?.data) return [];
    return taxonomiesResponse.data.map((tax) => ({
      value: tax.name,
      title: tax.label,
    }));
  }, [taxonomiesResponse]);

  const addCondition = () => {
    const newCondition = {
      taxonomy: availableTaxonomies[0]?.value || "category",
      field: "term_id",
      terms: [],
      operator: "IN",
    };
    setWpQuery((old) => ({
      ...old,
      tax_query: buildQueryState(
        [...getConditions(old.tax_query), newCondition],
        getRelation(old.tax_query)
      ),
    }));
  };

  const updateCondition = (index, field, value) => {
    setWpQuery((old) => {
      const currentConditions = getConditions(old.tax_query);
      
      const updates = { [field]: value };
      
      // 🔥 FIX 1: When taxonomy OR field changes, reset terms.
      // Because numeric IDs are invalid if the user switches to "slug" or "name".
      if (field === "taxonomy" || field === "field") {
        updates.terms = [];
      }
      
      currentConditions[index] = { ...currentConditions[index], ...updates };
      return {
        ...old,
        tax_query: buildQueryState(currentConditions, getRelation(old.tax_query)),
      };
    });
  };

  const removeCondition = (index) => {
    setWpQuery((old) => {
      const currentConditions = getConditions(old.tax_query);
      currentConditions.splice(index, 1);
      return {
        ...old,
        tax_query: buildQueryState(currentConditions, getRelation(old.tax_query)),
      };
    });
  };

  const updateRelation = (value) => {
    setWpQuery((old) => ({
      ...old,
      tax_query: buildQueryState(getConditions(old.tax_query), value),
    }));
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-surface-primary rounded-lg border border-border-default">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          Taxonomy Query Conditions
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
        <TaxCondition
          key={index}
          condition={condition}
          index={index}
          onUpdate={updateCondition}
          onRemove={removeCondition}
          availableTaxonomies={availableTaxonomies}
          isTaxonomiesLoading={isTaxonomiesLoading || isTaxonomiesRefetching}
        />
      ))}

      {conditions.length === 0 && (
        <p className="text-base animate-pulse text-text-primary italic text-center py-4 px-2 bg-surface-tertiary rounded-lg">
          No taxonomy conditions. Click "Add Condition" to filter by categories or tags.
        </p>
      )}
    </div>
  );
};

// Individual condition component
const TaxCondition = ({
  condition,
  index,
  onUpdate,
  onRemove,
  availableTaxonomies,
  isTaxonomiesLoading,
}) => {
  // 🔥 DYNAMIC: Fetch terms based on selected taxonomy
  const { data: termsResponse, isPending: isTermsLoading, isRefetching: isTermsRefetching } = useWpAllTerms({
    taxonomy: condition.taxonomy,
    hide_empty: false,
  });

  // 🔥 FIX 2: Dynamically map the `value` based on the selected `field`
  const terms = useMemo(() => {
    if (!termsResponse?.success || !termsResponse?.data) return [];
    
    const field = condition.field || "term_id";
    
    return termsResponse.data.map((term) => {
      let termValue;
      
      switch (field) {
        case "slug":
          termValue = term.slug;
          break;
        case "name":
          termValue = term.name;
          break;
        case "term_taxonomy_id":
          termValue = term.term_taxonomy_id ?? term.id; // Fallback to ID if not explicitly returned
          break;
        case "term_id":
        default:
          termValue = term.id;
          break;
      }

      return {
        value: termValue,
        title: `${term.name} (${term.count})`,
      };
    });
  }, [termsResponse, condition.field]); // Add condition.field to dependencies

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
              Taxonomy
            </MiniTitle>
            <Select
              className="!p-[unset]"
              inputClassName="!p-3 bg-surface-secondary text-xs"
              value={condition.taxonomy || ""}
              keywords={availableTaxonomies}
              useLoader={isTaxonomiesLoading}
              placeholder="Select Taxonomy"
              onAll={(val) => onUpdate(index, "taxonomy", val)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <MiniTitle className="text-xs text-text-secondary block w-fit">
              Field
            </MiniTitle>
            <Select
              className="!p-[unset]"
              inputClassName="!p-3 bg-surface-secondary text-xs"
              value={condition.field || "term_id"}
              keywords={TAX_FIELDS}
              onAll={(val) => onUpdate(index, "field", val)}
            />
          </div>
        </section>

        <section className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-2">
            <MiniTitle className="text-xs text-text-secondary block w-fit">
              Operator
            </MiniTitle>
            <Select
              className="!p-[unset] w-full h-full"
              inputClassName="!p-3 bg-surface-secondary text-xs w-full h-full"
              value={condition.operator || "IN"}
              keywords={TAX_OPERATORS}
              onAll={(val) => onUpdate(index, "operator", val)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <MiniTitle className="text-xs text-text-secondary block w-fit">
              Terms
            </MiniTitle>
            <Select
              className="!p-[unset]"
              inputClassName="!p-3 bg-surface-secondary text-xs"
              value={
                Array.isArray(condition.terms) ? condition.terms.join(",") : ""
              }
              keywords={terms}
              useLoader={isTermsLoading || isTermsRefetching}
              placeholder="Select Terms"
              multiple={true}
              onItemClicked={(val) => {
                const currentTerms = Array.isArray(condition.terms)
                  ? condition.terms
                  : [];
                const newTerms = currentTerms.includes(val)
                  ? currentTerms.filter((t) => t !== val)
                  : [...currentTerms, val];
                onUpdate(index, "terms", newTerms);
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
};