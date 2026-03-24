import React from "react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Privacy Policy
        </h1>

        <p className="text-sm text-gray-500 mb-4">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <section className="space-y-4 text-gray-700">
          <h2 className="font-semibold text-lg">1. Information We Collect</h2>
          <p>
            We collect name, email, academic details, and profile information.
          </p>

          <h2 className="font-semibold text-lg">2. How We Use Information</h2>
          <p>
            Your data is used to manage accounts, connect alumni, and improve the
            platform.
          </p>

          <h2 className="font-semibold text-lg">3. Data Protection</h2>
          <p>
            We implement security measures to protect your personal data.
          </p>

          <h2 className="font-semibold text-lg">4. Data Sharing</h2>
          <p>
            We do not sell your data. Information is shared only when required by
            law.
          </p>

          <h2 className="font-semibold text-lg">5. Cookies</h2>
          <p>
            Cookies are used to enhance user experience and analyze usage.
          </p>

          <h2 className="font-semibold text-lg">6. User Rights</h2>
          <ul className="list-disc ml-6">
            <li>Access your data</li>
            <li>Update your information</li>
            <li>Request account deletion</li>
          </ul>

          <h2 className="font-semibold text-lg">7. Data Retention</h2>
          <p>Your data is stored as long as your account is active.</p>

          <h2 className="font-semibold text-lg">8. Updates</h2>
          <p>This policy may be updated periodically.</p>

          <h2 className="font-semibold text-lg">9. Contact</h2>
          <p>Email: your@email.com</p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;