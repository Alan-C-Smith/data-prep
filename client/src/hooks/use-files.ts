import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

// GET /api/files
export function useFiles() {
  return useQuery({
    queryKey: [api.files.list.path],
    queryFn: async () => {
      const res = await fetch(api.files.list.path);
      if (!res.ok) throw new Error("Failed to fetch files");
      return api.files.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/files/:id
export function useFile(id: number) {
  return useQuery({
    queryKey: [api.files.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.files.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch file details");
      return api.files.get.responses[200].parse(await res.json());
    },
    enabled: !isNaN(id),
  });
}

// POST /api/files (Upload)
export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(api.files.upload.path, {
        method: api.files.upload.method,
        body: formData,
        // Content-Type is set automatically by browser with boundary for FormData
      });

      if (!res.ok) {
        if (res.status === 400) {
           const error = api.files.upload.responses[400].parse(await res.json());
           throw new Error(error.message);
        }
        throw new Error("Failed to upload file");
      }
      return api.files.upload.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.files.list.path] });
    },
  });
}

// DELETE /api/files/:id
export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.files.delete.path, { id });
      const res = await fetch(url, { method: api.files.delete.method });
      
      if (res.status === 404) throw new Error("File not found");
      if (!res.ok) throw new Error("Failed to delete file");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.files.list.path] });
    },
  });
}
