"use client";

import type { ReactNode } from "react";
import { Modal } from "@/components/ui/modal";

export type LegalDoc = "terms" | "privacy" | null;

/** Scrollable area with scrollbars hidden (still scrollable via wheel / touch). */
const legalScrollBody =
  "max-h-[min(70vh,560px)] space-y-6 overflow-y-auto pr-1 text-left sm:pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="font-headline text-sm font-bold text-on-background sm:text-base">{title}</h3>
      <div className="space-y-2 text-sm leading-relaxed text-on-secondary-container">{children}</div>
    </section>
  );
}

function TermsBody() {
  return (
    <div className={legalScrollBody}>
      <p className="text-xs text-on-secondary-container sm:text-sm">
        Last updated: March 2026. These Terms apply to the Stories website and related services
        (&ldquo;Stories,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;). They are meant as a general
        template—replace or review with qualified counsel before production use.
      </p>
      <Section title="1. Agreement">
        <p>
          By creating an account or using Stories, you agree to these Terms. If you do not agree,
          do not use the service.
        </p>
      </Section>
      <Section title="2. The service">
        <p>
          Stories provides tools to read, write, and share stories and related content. We may
          change, suspend, or discontinue features at any time. We do not guarantee uninterrupted or
          error-free access.
        </p>
      </Section>
      <Section title="3. Accounts">
        <p>
          You are responsible for your account credentials and for activity under your account. You
          must provide accurate information and be at least the minimum age required in your country
          to use the service.
        </p>
      </Section>
      <Section title="4. Your content">
        <p>
          You retain rights to content you submit. You grant Stories a license to host, display, and
          distribute your content as needed to operate the service. You must not post unlawful,
          infringing, or harmful material, or attempt to compromise security or other users.
        </p>
      </Section>
      <Section title="5. Acceptable use">
        <p>
          Do not misuse Stories (for example: scraping without permission, harassment, malware, or
          circumventing limits). We may suspend or terminate accounts that violate these rules.
        </p>
      </Section>
      <Section title="6. Disclaimers">
        <p>
          The service is provided &ldquo;as is.&rdquo; To the fullest extent permitted by law, we
          disclaim warranties of merchantability, fitness for a particular purpose, and
          non-infringement.
        </p>
      </Section>
      <Section title="7. Limitation of liability">
        <p>
          To the extent permitted by law, Stories and its team will not be liable for indirect,
          incidental, special, consequential, or punitive damages, or for loss of profits, data, or
          goodwill.
        </p>
      </Section>
      <Section title="8. Changes">
        <p>
          We may update these Terms. We will post the revised version and update the date above.
          Continued use after changes means you accept the updated Terms.
        </p>
      </Section>
      <Section title="9. Contact">
        <p>
          For questions about these Terms, contact us through the channels listed on the site or in
          your account settings.
        </p>
      </Section>
    </div>
  );
}

function PrivacyBody() {
  return (
    <div className={legalScrollBody}>
      <p className="text-xs text-on-secondary-container sm:text-sm">
        Last updated: March 2026. This Privacy Policy describes how Stories (&ldquo;we,&rdquo;
        &ldquo;us&rdquo;) handles information when you use our website and services. It is a general
        overview—not legal advice.
      </p>
      <Section title="1. Information we collect">
        <p>
          We may collect information you provide (such as name, email, and profile details),
          content you create, and technical data (such as device type, browser, approximate
          location from IP, and usage logs) to run and improve the service and keep it secure.
        </p>
      </Section>
      <Section title="2. How we use information">
        <p>
          We use this information to provide and personalize Stories, authenticate accounts, send
          service-related messages, analyze usage in aggregate, fix bugs, enforce our Terms, and
          comply with law.
        </p>
      </Section>
      <Section title="3. Cookies and similar technologies">
        <p>
          We may use cookies and similar technologies for session management, preferences, and
          analytics. You can control cookies through your browser settings; some features may not
          work if you disable them.
        </p>
      </Section>
      <Section title="4. Sharing">
        <p>
          We do not sell your personal information. We may share data with service providers who
          assist us (hosting, email, analytics) under confidentiality obligations, when required by
          law, or to protect rights and safety.
        </p>
      </Section>
      <Section title="5. Retention">
        <p>
          We keep information only as long as needed for the purposes above, unless a longer period
          is required or permitted by law.
        </p>
      </Section>
      <Section title="6. Security">
        <p>
          We take reasonable measures to protect data, but no online service is completely secure. We
          cannot guarantee absolute security.
        </p>
      </Section>
      <Section title="7. Your choices">
        <p>
          Depending on your region, you may have rights to access, correct, delete, or export
          certain data, or to object to some processing. Contact us to exercise those rights where
          applicable.
        </p>
      </Section>
      <Section title="8. Children">
        <p>
          Stories is not directed at children under 13 (or the age required in your jurisdiction).
          We do not knowingly collect their personal information.
        </p>
      </Section>
      <Section title="9. International users">
        <p>
          If you access Stories from outside the country where we operate, your information may be
          transferred and processed there, under appropriate safeguards where required.
        </p>
      </Section>
      <Section title="10. Changes to this policy">
        <p>
          We may update this Privacy Policy and will revise the date above. Material changes may be
          communicated through the site or by email when appropriate.
        </p>
      </Section>
      <Section title="11. Contact">
        <p>
          For privacy questions or requests, contact us through the channels provided on the site.
        </p>
      </Section>
    </div>
  );
}

export function LegalDocumentModals({
  open,
  onClose,
}: {
  open: LegalDoc;
  onClose: () => void;
}) {
  const isOpen = open !== null;
  const title =
    open === "terms"
      ? "Terms of Service"
      : open === "privacy"
        ? "Privacy Policy"
        : "Legal";

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={title}
      variant="editorial"
      className="max-w-2xl"
    >
      {open === "terms" ? <TermsBody /> : open === "privacy" ? <PrivacyBody /> : null}
    </Modal>
  );
}
