import React from 'react';

const LegalLayout = ({ title, date, children }: { title: string, date: string, children: React.ReactNode }) => (
    <div className="pt-32 pb-24 px-4 min-h-screen bg-black text-white">
        <div className="max-w-3xl mx-auto">
            <div className="mb-12 border-b border-white/10 pb-8">
                <h1 className="text-4xl md:text-5xl font-serif font-light mb-4 text-white">{title}</h1>
                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Last Updated: {date}</p>
            </div>
            <div className="space-y-8 text-gray-400 font-light leading-relaxed text-lg">
                {children}
            </div>
        </div>
    </div>
);

export const PrivacyPolicy = () => (
    <LegalLayout title="Privacy Policy" date="February 16, 2026">
        <p>Your privacy is important to us. It is X100's policy to respect your privacy regarding any information we may collect from you across our website, x100.ai, and other sites we own and operate.</p>

        <h3 className="text-2xl text-white font-serif mt-8 mb-4">1. Information We Collect</h3>
        <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>

        <h3 className="text-2xl text-white font-serif mt-8 mb-4">2. Usage of Data</h3>
        <p>We use your data to provide, maintain, and improve our services, including to:</p>
        <ul className="list-disc pl-5 space-y-2">
            <li>Process transactions and manage your account.</li>
            <li>Send you technical notices, updates, security alerts, and support messages.</li>
            <li>Respond to your comments, questions, and requests.</li>
            <li>Train our AI models (only with anonymized data where explicit consent is given).</li>
        </ul>

        <h3 className="text-2xl text-white font-serif mt-8 mb-4">3. Data Retention</h3>
        <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>
    </LegalLayout>
);

export const TermsOfService = () => (
    <LegalLayout title="Terms of Service" date="February 16, 2026">
        <p>By accessing the website at x100.ai, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>

        <h3 className="text-2xl text-white font-serif mt-8 mb-4">1. Use License</h3>
        <p>Permission is granted to temporarily download one copy of the materials (information or software) on X100's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
        <ul className="list-disc pl-5 space-y-2">
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
            <li>attempt to decompile or reverse engineer any software contained on X100's website;</li>
        </ul>

        <h3 className="text-2xl text-white font-serif mt-8 mb-4">2. Disclaimer</h3>
        <p>The materials on X100's website are provided on an 'as is' basis. X100 makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

        <h3 className="text-2xl text-white font-serif mt-8 mb-4">3. Limitations</h3>
        <p>In no event shall X100 or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on X100's website.</p>
    </LegalLayout>
);

export const GDPR = () => (
    <LegalLayout title="GDPR Compliance" date="February 16, 2026">
        <p>We are committed to ensuring the security and protection of the personal information that we process, and to provide a compliant and consistent approach to data protection.</p>

        <h3 className="text-2xl text-white font-serif mt-8 mb-4">Your Rights Under GDPR</h3>
        <p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights. X100 aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.</p>
        <ul className="list-disc pl-5 space-y-2">
            <li><strong>The right to access, update or to delete</strong> the information we have on you.</li>
            <li><strong>The right of rectification.</strong> You have the right to have your information rectified if that information is inaccurate or incomplete.</li>
            <li><strong>The right to object.</strong> You have the right to object to our processing of your Personal Data.</li>
            <li><strong>The right of restriction.</strong> You have the right to request that we restrict the processing of your personal information.</li>
            <li><strong>The right to data portability.</strong> You have the right to be provided with a copy of the information we have on you in a structured, machine-readable and commonly used format.</li>
            <li><strong>The right to withdraw consent.</strong> You also have the right to withdraw your consent at any time where X100 relied on your consent to process your personal information.</li>
        </ul>

        <h3 className="text-2xl text-white font-serif mt-8 mb-4">Data Processing Officer</h3>
        <p>If you wish to be informed what Personal Data we hold about you and if you want it to be removed from our systems, please contact us at privacy@x100.ai.</p>
    </LegalLayout>
);
