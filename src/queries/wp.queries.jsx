import {
  wp_delete_posts,
  wp_get_blocks,
  wp_get_posts,
  wp_get_symbols,
  wp_insert_posts,
} from "@/Apps/wordpress/functions";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { wpTokensState } from "@/helpers/atoms";
import { fetcherWorker } from "@/helpers/defineWorkers";
import {
  callWorkerCommand,
  createWpMutationFn,
  getProjectId,
  getWpPageConfig,
  isWordpress,
} from "@/helpers/functions";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";

export const usePosts = (type = "") => {
  return useQuery({
    queryKey: [type, getProjectId()],
    queryFn: () =>
      callWorkerCommand(fetcherWorker, "wp_get_posts", {
        projectId: getProjectId(),
        post_type: type,
      }),
    enabled: Boolean(type) && isWordpress(),
    refetchOnMount: false,
  });
};

export const useWpGet = (endpoint, params = {}) => {
  return useQuery({
    queryKey: [endpoint, params, getProjectId()],
    queryFn: () =>
      callWorkerCommand(fetcherWorker, "wp_get", {
        projectId: getProjectId(),
        endpoint,
        params,
      }),
    enabled: Boolean(endpoint) && isWordpress(),
    refetchOnMount: false,
  });
};

// ✅ ADD THIS NEW HOOK FOR PAGINATION
export const useWpGetInfinite = (endpoint, options = {}) => {
  return useInfiniteQuery({
    queryKey: ["wp_get_infinite", endpoint],
    queryFn: ({ pageParam = 1 }) =>
      callWorkerCommand(fetcherWorker, "wp_get", {
        projectId: getProjectId(),
        endpoint,
        params: { per_page: 100, page: pageParam },
      }),
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has less than 100 items, we reached the end. Stop fetching!
      if (!lastPage || lastPage.length < 100) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    // Automatically disables if endpoint is empty (e.g. postType is "")
    enabled: Boolean(endpoint) && isWordpress(),
    ...options,
  });
};

export const useGetInfMetaPostsOnly = () => {
  return useQuery({
    queryKey: ["inf_meta_posts", getProjectId()],
    queryFn: () =>
      callWorkerCommand(fetcherWorker, "wp_get_posts_with_inf_meta", {
        projectId: getProjectId(),
      }),
    enabled: isWordpress(),
    refetchOnMount: false,
  });
};

export const useGetPostHelemt = (post_id) => {
  const wp_config = getWpPageConfig();
  return useQuery({
    queryKey: ["post_helmet", getProjectId(), post_id],
    queryFn: () =>
      callWorkerCommand(fetcherWorker, "wp_get_post_helmet", {
        projectId: getProjectId(),
        post_id: post_id,
      }),
    enabled: isWordpress() && Boolean(wp_config.id),
    refetchOnMount: false,
  });
};

export const useWpSettings = () => {
  return useQuery({
    queryKey: ["wp_settings", getProjectId()],
    queryFn: () =>
      callWorkerCommand(fetcherWorker, "wp_get_settings", {
        projectId: getProjectId(),
      }),
    enabled: isWordpress(),
    refetchOnMount: false,
  });
};

export const useWpTokens = () => {
  const [tokensVars, setTokensVars] = useRecoilState(wpTokensState);
  const wp_config = getWpPageConfig();
  return useQuery({
    queryKey: ["wp_tokens", getProjectId(), wp_config.id, tokensVars],
    queryFn: () =>
      callWorkerCommand(fetcherWorker, "wp_get_tokens", {
        projectId: getProjectId(),
        post_id: wp_config.id,
        include_arrays: true,
        vars: tokensVars,
      }),
    enabled: isWordpress(),

    refetchOnMount: false,
  });
};

export const useWpPostTypes = ({
  exclude = ["inf_symbols", "inf_blocks", "inf_template", "inf_motions"].join(","),
  show_builtin = false,
}) => {
  return useQuery({
    queryKey: ["wp_post_types", getProjectId()],
    queryFn: () =>
      callWorkerCommand(fetcherWorker, "wp_get_post_types", {
        projectId: getProjectId(),
        exclude,
        show_builtin,
      }),
    enabled: isWordpress(),
    refetchOnMount: false,
  });
};

/**
 * 
 * @param {import("@/helpers/types").WpAuthorsParams} params 
 * @returns 
 */
export const useWpAuthors = (params = {}) => {
  return useQuery({
    queryKey: ["wp_authors", getProjectId() , params],
    queryFn: () =>
      callWorkerCommand(fetcherWorker, "wp_get_authors", {
        projectId: getProjectId(),
        ...params,
      }),
    enabled: isWordpress(),
    refetchOnMount: false,
  });
};

/**
 *
 * @param {import("@/helpers/types").WpPostsAllParams} params
 * @returns
 */
export const useWpAllPosts = (params = {}) => {
  return useQuery({
    queryKey: ["wp_all_posts", getProjectId(), params],
    queryFn: () =>
      callWorkerCommand(fetcherWorker, "wp_get_all_posts", {
        projectId: getProjectId(),
        exclude: ["inf_symbols", "inf_blocks", "inf_template", "inf_motions"],
        ...params,
      }),
    enabled: isWordpress(),
    refetchOnMount: false,
  });
};

/**
 *
 * @param {import("@/helpers/types").WpPostsAllParams} params
 * @returns
 */
export const useWpAllCategories = (params = {}) => {
  return useQuery({
    queryKey: ["wp_all_categories", getProjectId(), params],
    queryFn: () =>
      callWorkerCommand(fetcherWorker, "wp_get_all_categoires", {
        projectId: getProjectId(),
        ...params,
      }),
    enabled: isWordpress(),
    refetchOnMount: false,
  });
};
/**
 *
 * @param {import("@/helpers/types").WpTagsAllParams} params
 * @returns
 */
export const useWpAllTags = (params = {}) => {
  return useQuery({
    queryKey: ["wp_all_tags", getProjectId(), params],
    queryFn: () =>
      callWorkerCommand(fetcherWorker, "wp_get_all_tags", {
        projectId: getProjectId(),
        ...params,
      }),
    enabled: isWordpress(),
    refetchOnMount: false,
  });
};

/**
 *
 * @param {import("@/helpers/types").WpTaxonomiesAllParams} params
 * @returns
 */
export const useWpAllTaxonomies = (params = {}) => {
  return useQuery({
    queryKey: ["wp_all_taxonomies", getProjectId(), params],
    queryFn: () =>
      callWorkerCommand(fetcherWorker, "wp_get_all_taxonomies", {
        projectId: getProjectId(),
        ...params,
      }),
    enabled: isWordpress(),
    refetchOnMount: false,
  });
};

/**
 *
 * @param {import("@/helpers/types").WpTermsAllParams} params
 */
export const useWpAllTerms = (params = {}) => {
  return useQuery({
    queryKey: ["wp_all_terms", getProjectId(), params],
    queryFn: () =>
      callWorkerCommand(fetcherWorker, "wp_get_all_terms", {
        projectId: getProjectId(),
        ...params,
      }),
    enabled: isWordpress(),
    refetchOnMount: false,
  });
};

export const useUpdateWpSettingsMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWpMutationFn(fetcherWorker, "wp_update_settings"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wp_settings"], refetchType: "all" });
    },
  });
};

export const useUpdatePostHelemtMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWpMutationFn(fetcherWorker, "wp_update_post_helmet"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["post_helmet"], refetchType: "all" });
    },
  });
};

export const useInsertPostsMutation = (type) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWpMutationFn(fetcherWorker, "wp_insert_posts"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [type], refetchType: "all" });
    },
  });
};

export const useDeletePostsMutation = (type) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWpMutationFn(fetcherWorker, "wp_delete_posts"),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: [type], refetchType: "all" }),
  });
};

export const useUnlinkSymbolsMutation = (type) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWpMutationFn(fetcherWorker, "wp_unlink_symbols"),
    // onSuccess: () =>
    //   qc.invalidateQueries({ queryKey: [type], refetchType: "all" }),
  });
};

export const useConnectWpMutation = () => {
  return useMutation({
    mutationFn: createWpMutationFn(fetcherWorker, "wp_connect"),
  });
};

export const useGetWpOptionQueryMutation = () => {
  return useMutation({
    mutationFn: createWpMutationFn(fetcherWorker, "wp_get_option"),
  });
};

export const useWpUpdateOption = ()=>{
  return useMutation({
    mutationFn: createWpMutationFn(fetcherWorker, "wp_update_option"),
  });
}

export const useCreateWpSinglePostMutation = () => {
  return useMutation({
    mutationFn: createWpMutationFn(fetcherWorker, "wp_create_single"),
  });
};
