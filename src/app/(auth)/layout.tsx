export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="auth-body-bg-themed">
            {children}
        </div>
    );
}
