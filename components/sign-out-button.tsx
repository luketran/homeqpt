export function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
      >
        Đăng xuất
      </button>
    </form>
  );
}
