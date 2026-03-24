import React from "react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Terms & Conditions
        </h1>

        <p className="text-sm text-gray-500 mb-4">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <section className="space-y-4 text-gray-700">
          <h2 className="font-semibold text-lg">1. Acceptance of Terms</h2>
          <p>
            By using this Alumni Web Application, you agree to comply with these
            terms and conditions.
          </p>

          <h2 className="font-semibold text-lg">2. User Eligibility</h2>
          <p>
            This platform is intended for alumni, students, and administrators.
            You must provide accurate information during registration.
          </p>

          <h2 className="font-semibold text-lg">3. User Responsibilities</h2>
          <p>
            You are responsible for maintaining your account security and must
            not misuse the platform.
          </p>

          <h2 className="font-semibold text-lg">4. Platform Usage</h2>
          <p>
            The platform is designed for alumni networking, sharing
            opportunities, and collaboration.
          </p>

          <h2 className="font-semibold text-lg">5. Prohibited Activities</h2>
          <ul className="list-disc ml-6">
            <li>Uploading harmful or illegal content</li>
            <li>Attempting unauthorized access</li>
            <li>Spamming or fraudulent activities</li>
          </ul>

          <h2 className="font-semibold text-lg">6. Account Suspension</h2>
          <p>
            We reserve the right to suspend accounts that violate these terms.
          </p>

          <h2 className="font-semibold text-lg">7. Limitation of Liability</h2>
          <p>
            We are not responsible for user-generated content or data loss.
          </p>

          <h2 className="font-semibold text-lg">8. Changes to Terms</h2>
          <p>
            These terms may be updated at any time. Continued use means
            acceptance.
          </p>

          <h2 className="font-semibold text-lg">9. Contact</h2>
          <p>Email: your@email.com</p>
        </section>
      </div>
    </div>
  );
};

export default Terms;