import { Link } from "react-router-dom";
export default function AdminRegister() {
  return <main className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
    <div className="max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-8 text-white text-center">
      <h1 className="text-2xl font-bold mb-3">IndiFolks administration</h1>
      <p className="text-gray-300 mb-6">Administrator registration is disabled for security. The project owner must create an administrator account using the backend setup script.</p>
      <Link to="/admin/login" className="text-violet-300 underline">Return to admin sign in</Link>
    </div>
  </main>;
}
