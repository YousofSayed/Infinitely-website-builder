import {
  wp_delete_posts,
  wp_get_blocks,
  wp_get_posts,
  wp_get_symbols,
  wp_insert_posts,
} from "@/apps/wordpress/functions";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { fetcherWorker } from "@/helpers/defineWorkers";
import {
  callWorkerCommand,
  createWpMutationFn,
  getProjectId,
  isWordpress,
} from "@/helpers/functions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

/**
 *
 * @param {"symbols" | "templates"} type
 * @returns
 */
export const usePosts = (type = "") => {
  return useQuery({
    queryKey: [type],
    queryFn: () =>
      callWorkerCommand(fetcherWorker, "wp_get_posts", {
        projectId: getProjectId(),
        post_type: type,
      }),
    enabled: Boolean(type) && isWordpress(),
  });
};

export const useInsertPostsMutation = (type) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWpMutationFn(fetcherWorker, "wp_insert_posts"),
    onSuccess: () =>{
       qc.invalidateQueries({queryKey:[type] , refetchType:'all'});
    },
  });
};

export const useDeletePostsMutation = (type) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWpMutationFn(fetcherWorker, "wp_delete_posts"),
    onSuccess: () => qc.invalidateQueries({queryKey:[type] , refetchType:'all'}),
  });
};

export const useUnlinkSymbolsMutation = (type)=>{
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWpMutationFn(fetcherWorker, "wp_unlink_symbols"),
    onSuccess: () => qc.invalidateQueries({queryKey:[type] , refetchType:'all'}),
  });
}