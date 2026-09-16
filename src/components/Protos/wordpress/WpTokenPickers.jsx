import { useEffect, useMemo } from "react";
import { useRecoilState } from "recoil";
import { showWpTokensPickerState } from "@/helpers/atoms";
import { useWpTokens } from "@/queries/wp.queries";
import { getParentNode, isWordpress } from "@/helpers/functions";
import { inf_tokens_container, inf_tokens_ignore } from "@/constants/shared";
import { Icons } from "@/components/Icons/Icons";
import {
  TokenPicker,
  defaultIsSupportedField,
} from "@/components/Protos/TokenPicker";

const supportedApps = [isWordpress()];

/**
 * WP Specific Field Validation
 */
const isSupportedField = (el) => {
  if (!supportedApps.some(Boolean)) return false;
  if (!getParentNode((n) => n.hasAttribute(inf_tokens_container), el))
    return false;
  if (el.hasAttribute(inf_tokens_ignore)) return false;
  return defaultIsSupportedField(el);
};

export const WpTokenPickers = () => {
  const [show, setShow] = useRecoilState(showWpTokensPickerState);
  const {
    data: tokensRes,
    isPending: tokensLoading,
    isRefetching: tokensRefetch,
  } = useWpTokens();

  const allTokens = useMemo(() => {
    if (!tokensRes?.success) return [];
    return Object.values(tokensRes.groups ?? {})
      .flatMap((g) => g?.tokens ?? [])
      .filter(Boolean);
  }, [tokensRes]);

  const renderItem = (token, index, isSelected) => (
    <div
      // 🎯 Uses the global tooltip ID provided by TokenPicker
      data-tooltip-id="token-picker-tooltip"
      data-tooltip-content={token.key}
      className={`flex items-center justify-between w-full bg-surface-secondary rounded-lg gap-2 px-3 py-2 text-left transition-colors ${
        isSelected
          ? "!bg-brand-primary !text-white"
          : "!text-text-primary hover:!bg-surface-main"
      }`}
    >
      <div className="flex items-center gap-2 max-w-[70%] overflow-hidden text-ellipsis">
        <Icons.code width={16} height={16} strokeColor="#e2e8f0" />
        <span className="truncate">{token.key}</span>
      </div>
      <span className="text-slate-200 font-medium block p-2 bg-surface-main rounded-lg">
        {token.type}
      </span>
    </div>
  );

  return (
    <TokenPicker
      isOpen={show}
      onOpenChange={setShow}
      starter="{{"
      ender="}}"
      items={allTokens}
      isLoading={tokensLoading}
      isRefetching={tokensRefetch}
      searchKeys={["key", "label", "type"]}
      isSupportedField={isSupportedField}
      extractValue={(token) => token.key}
      getItemId={(token) => token.key}
      renderItem={renderItem}
      placeholder="Search wordpress tokens..."
      headerIcon={<Icons.code width={16} height={16} strokeColor="#e2e8f0" />}
      refreshIcon={<Icons.refresh width={15} height={15} />}
      prefix={(value) => `{{${value}}}`}
    />
  );
};
