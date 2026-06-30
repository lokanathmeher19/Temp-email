import React from 'react';

const InfoSection = () => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-16 mb-8 px-4 sm:px-6 animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
      <div className="text-center space-y-8">
        
        {/* Main Info Block */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            What is Disposable Temporary E-mail?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
            <strong className="text-slate-200">Disposable email</strong> - is a free email service that allows you to receive email at a temporary address that self-destructs after a certain time elapses. It is also known by names like: tempmail, 10minutemail, 10minmail, throwaway email, fake-mail, fake email generator, burner mail or trash-mail. Many forums, Wi-Fi owners, websites and blogs ask visitors to register before they can view content, post comments or download something. TempMail Pro is an advanced throwaway email service that helps you avoid spam and stay safe.
          </p>
        </section>

        {/* Disclaimer / Terms Block */}
        <section className="pt-8 border-t border-slate-800/50 space-y-4">
          <h3 className="text-xl font-semibold text-slate-200">
            Terms & Disclaimer
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-3xl mx-auto">
            By using this service, you agree that TempMail Pro is provided "as-is" without any warranty. 
            We do not permanently store your emails, and all messages are automatically deleted when the timer expires or when you manually delete them. 
            Please do not use temporary emails for important, sensitive, or confidential accounts, as you may lose access to them once the address expires. 
            We are not responsible for any lost data or blocked registrations. Use responsibly to keep your real mailbox clean and secure.
          </p>
        </section>

      </div>
    </div>
  );
};

export default InfoSection;
