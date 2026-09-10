import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import WhatsappForm from "@/components/WhatsappForm";
import Logo from "@/components/Logo";
import { MailIcon, PhoneIcon } from "@/components/Icons";
import { contact, site, telLink } from "@/data/site";
import { services } from "@/data/services";
import { cms } from "@/cms/paths";
import { useCmsVersion } from "@/cms/store";

export default function Contact() {
  /* מאזין לשינויי מצב העריכה, אחרת עריכה ושחזור לא מתעדכנים בדף */
  useCmsVersion();

  return (
    <>
      <Seo
        title={contact.seo.title}
        description={contact.seo.description}
        path="/contact"
      />

      <section className="relative overflow-hidden bg-accent-wash pb-16 pt-10 md:pb-24 md:pt-16">
        {/* אורות רכים ברקע - ההד של "למצוא את האור" */}
        <span
          aria-hidden
          className="absolute -left-24 top-8 h-72 w-72 animate-float rounded-full bg-gold/30 blur-3xl"
        />
        <span
          aria-hidden
          className="absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-brand/15 blur-3xl"
        />

        <div className="container relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2.5 font-display text-sm font-bold text-brand">
              <span aria-hidden className="h-px w-6 bg-brand" />
              <span {...cms("site.contact.eyebrow")}>{contact.eyebrow}</span>
              <span aria-hidden className="h-px w-6 bg-brand" />
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl">
              <span {...cms("site.contact.title")}>{contact.title}</span>{" "}
              <span {...cms("site.contact.titleHighlight")} className="underline-brush">
                {contact.titleHighlight}
              </span>
            </h1>
            <p
              {...cms("site.contact.intro")}
              className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted sm:text-xl"
            >
              {contact.intro}
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch lg:gap-8">
            {/* --- פאנל כהה: דרכי קשר ואיך זה עובד --- */}
            <Reveal variant="side" className="order-2 lg:order-1">
              <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-dark via-brand-dark to-brand p-8 text-white shadow-lift sm:p-10">
                <span
                  aria-hidden
                  className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/25 blur-3xl"
                />
                <span
                  aria-hidden
                  className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-brand-light/30 blur-3xl"
                />

                <div className="relative flex h-full flex-col">
                  <Logo variant="horizontal" withTagline invert className="w-fit" />
                  <h2 {...cms("site.contact.panelTitle")} className="mt-6 text-3xl text-white">
                    {contact.panelTitle}
                  </h2>
                  <p {...cms("site.contact.panelText")} className="mt-3 leading-relaxed text-white/80">
                    {contact.panelText}
                  </p>

                  <a
                    href={telLink}
                    className="group mt-7 flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 transition-colors duration-300 hover:bg-white/15"
                  >
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold text-brand-dark transition-transform duration-300 group-hover:scale-105">
                      <PhoneIcon className="h-6 w-6" />
                    </span>
                    <span>
                      <span {...cms("site.contact.phoneLabel")} className="block text-sm text-white/70">
                        {contact.phoneLabel}
                      </span>
                      <span className="block font-display text-xl font-bold text-white" dir="ltr">
                        {site.phone.display}
                      </span>
                    </span>
                  </a>

                  {site.email && (
                    <a
                      href={`mailto:${site.email}`}
                      className="group mt-3 flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 transition-colors duration-300 hover:bg-white/15"
                    >
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                        <MailIcon className="h-6 w-6" />
                      </span>
                      <span>
                        <span className="block text-sm text-white/70">אימייל</span>
                        <span className="block font-display text-lg font-bold text-white">
                          {site.email}
                        </span>
                      </span>
                    </a>
                  )}

                  <ol className="mt-8 space-y-4">
                    {contact.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 font-display text-sm font-bold text-gold ring-1 ring-white/15">
                          {i + 1}
                        </span>
                        <span>
                          <span
                            {...cms(`site.contact.steps.${i}.title`)}
                            className="block font-display font-bold text-white"
                          >
                            {step.title}
                          </span>
                          <span
                            {...cms(`site.contact.steps.${i}.text`)}
                            className="block text-sm leading-relaxed text-white/75"
                          >
                            {step.text}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-8">
                    <p {...cms("site.contact.topicsLabel")} className="text-sm font-bold text-gold">
                      {contact.topicsLabel}
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {services.map((service, i) => (
                        <li key={service.id}>
                          <Link
                            to={service.path}
                            className="block rounded-full bg-white/10 px-3.5 py-1.5 text-sm text-white/90 ring-1 ring-white/15 transition-colors duration-200 hover:bg-white/20 hover:text-white hover:ring-white/40 focus-visible:bg-white/20 focus-visible:text-white"
                          >
                            <span {...cms(`services.${i}.navLabel`)}>{service.navLabel}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* --- הטופס - נשלח ישירות לוואטסאפ --- */}
            <Reveal delay={120} className="order-1 lg:order-2">
              <WhatsappForm />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
