export function PageLoading() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <span
        role="status"
        aria-label="Đang tải"
        className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-slate-900"
      />
    </div>
  );
}
