import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../api";

export function useInfiniteFavorites(limit = 20) {
  return useInfiniteQuery(
    ["favorites", limit],
    async ({ pageParam = undefined }) => {
      const resp = await api.get("/favorites", {
        params: { limit, cursor: pageParam }
      });
      return resp.data;
    },
    {
      getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined)
    }
  );
}
