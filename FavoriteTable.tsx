import React, { useRef, useEffect, useState } from "react";
import { useInfiniteFavorites } from "../hooks/useInfiniteFavorites";
import api from "../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import FavoriteForm from "./FavoriteForm";
import ConfirmDialog from "./ConfirmDialog";

export default function FavoriteTable() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteFavorites(15);
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!bottomRef.current) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    }, { rootMargin: "200px" });

    observer.current.observe(bottomRef.current);
    return () => observer.current?.disconnect();
  }, [bottomRef.current, hasNextPage]);

  const deleteMutation = useMutation((id: number) => api.delete(`/favorites/${id}`), {
    onSuccess: () => queryClient.invalidateQueries(["favorites"]),
  });

  if (status === "loading") return <div>Loading...</div>;
  if (status === "error") return <div>Error loading favorites.</div>;

  const items = data?.pages.flatMap((p: any) => p.data) ?? [];

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (selectedId) deleteMutation.mutate(selectedId);
    setShowConfirm(false);
    setSelectedId(null);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left">Title</th>
              <th className="px-2 py-2 text-left">Type</th>
              <th className="px-2 py-2 text-left">Director</th>
              <th className="px-2 py-2 text-left">Budget</th>
              <th className="px-2 py-2 text-left">Location</th>
              <th className="px-2 py-2 text-left">Duration</th>
              <th className="px-2 py-2 text-left">Year/Time</th>
              <th className="px-2 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item: any) => (
              <tr key={item.id}>
                <td className="px-2 py-2">{item.title}</td>
                <td className="px-2 py-2">{item.type}</td>
                <td className="px-2 py-2">{item.director}</td>
                <td className="px-2 py-2">{item.budget}</td>
                <td className="px-2 py-2">{item.location}</td>
                <td className="px-2 py-2">{item.duration}</td>
                <td className="px-2 py-2">{item.yearTime}</td>
                <td className="px-2 py-2">
                  <FavoriteForm initial={item} mode="edit" />
                  <button onClick={() => handleDeleteClick(item.id)} className="ml-2 px-2 py-1 border rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div ref={bottomRef} className="h-8 flex items-center justify-center mt-4">
        {isFetchingNextPage ? "Loading more..." : hasNextPage ? "Scroll to load more" : "No more records"}
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Delete Entry"
        message="Are you sure you want to delete this movie/show?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
