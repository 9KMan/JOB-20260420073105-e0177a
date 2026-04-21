export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
      <div className="text-center max-w-3xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          MedClaims Pro
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Professional medical claims submission platform for surgeons and medical coders.
          Streamline your insurance claims process with our powerful SaaS solution.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary-600 px-6 py-3 text-base font-medium text-white hover:bg-primary-700"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Get Started
          </a>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Submission</h3>
            <p className="text-gray-500">Submit claims quickly with our intuitive interface and built-in validation.</p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">HIPAA Compliant</h3>
            <p className="text-gray-500">Enterprise-grade security to protect your patients' sensitive data.</p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
            <p className="text-gray-500">Track claim status from submission to payment with live updates.</p>
          </div>
        </div>
      </div>
    </main>
  );
}