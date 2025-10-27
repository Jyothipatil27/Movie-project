import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  title: z.string().min(1, "Required"),
  type: z.enum(["Movie","TV Show"]),
  director: z.string().optional(),
  budget: z.string().optional(),
  location: z.string().optional(),
  duration: z.string().optional(),
  yearTime: z.string().optional(),
  posterUrl: z.string().optional(),
  notes: z.string().optional()
});

type FormData = z.infer<typeof schema>;

export default function FavoriteForm({ initial, mode = "add" } : {
  initial?: Partial<FormData> & { id?: number };
  mode?: "add"|"edit";
}) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initial ?? { title: "", type: "Movie" }
  });

  const createMutation = useMutation((data: FormData) => api.post("/favorites", data), {
    onSuccess: () => { queryClient.invalidateQueries(["favorites"]); reset(); }
  });

  const editMutation = useMutation((payload: { id: number; data: Partial<FormData> }) => api.put(`/favorites/${payload.id}`, payload.data), {
    onSuccess: () => { queryClient.invalidateQueries(["favorites"]); }
  });

  function onSubmit(values: FormData) {
    if (mode === "add") createMutation.mutate(values);
    else if (mode === "edit" && initial?.id) editMutation.mutate({ id: initial.id, data: values });
  }

  return (
    <form className="flex gap-2 items-center" onSubmit={handleSubmit(onSubmit)}>
      <input {...register("title")} placeholder="Title" className="border px-2 py-1 rounded" />
      <select {...register("type")} className="border px-2 py-1 rounded">
        <option value="Movie">Movie</option>
        <option value="TV Show">TV Show</option>
      </select>
      <button type="submit" className="px-2 py-1 border rounded">{mode === "add" ? "Add" : "Save"}</button>
    </form>
  );
}
