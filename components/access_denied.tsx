import Link from "next/link"
export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-8 text-center">
      <div className="w-20 h-2 bg-black mb-8"></div> {/* Heavy brutalist accent line */}
      
      <h1 className="text-5xl md:text-7xl font-extrabold text-black tracking-tight mb-4">
        Restricted.
      </h1>
      
      <p className="text-xl text-gray-500 max-w-lg mb-8 font-light">
        You do not have permission to view this directory. Please verify your account privileges.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <span className="font-mono text-sm bg-gray-100 text-gray-600 py-2 px-4 rounded-md">
          Status: 403 / UNAUTHORIZED
        </span>
        <Link href ={'/protected/settings'} className="font-semibold text-sm bg-black text-white py-2 px-6 rounded-md hover:bg-gray-800 transition-colors">
          Go Back
        </Link>
      </div>
    </div>
  );
}