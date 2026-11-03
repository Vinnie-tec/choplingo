
type AdminHeaderProps = {
  adminName: string;
};

export default function AdminHeader({
  adminName,
}: AdminHeaderProps) {
  return (
    <header>
      <p>Administration</p>
      <p>Welcome, {adminName}</p>
    </header>
  );
}
