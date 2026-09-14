import { fetcherWorker } from "@/helpers/defineWorkers";
import { callWorkerCommand } from "@/helpers/functions";
import { useQuery } from "@tanstack/react-query";

export const useCDNLibraries = ({ search }) => {
  return useQuery({
    queryKey: ["cdn-libraries" , search],
    queryFn: () =>
      callWorkerCommand(fetcherWorker, "getCDNLibraries", {
        search,
      }),
  });
};
