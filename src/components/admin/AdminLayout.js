import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout({ children, title }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar />
            <div className="pl-16">
                <Topbar title={title} />
                <main className="p-4 overflow-y-auto bg-gray-50 min-h-screen">{children}</main>
            </div>
        </div>
    );
}
