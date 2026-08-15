import Image from "next/image";
import { BookingLink } from "@/components/booking-link";
import { BrandMark } from "@/components/brand-mark";
import { SiteHeader } from "@/components/site-header";
import { Testimonial } from "@/components/testimonial";

const team = [
  {
    role: "Former Admissions Officers",
    credential: "Elite Universities",
    description:
      "They sat on the other side of the table. They know exactly how a top college reads an application — and we build the strategy around it.",
  },
  {
    role: "Ivy League Mentors",
    credential: "Ivy League Graduates & Students",
    description:
      "They have been through the most competitive admissions processes themselves, and turn strategy into essays that sound like your child.",
  },
  {
    role: "Executive Coaches",
    credential: "Mindset & Performance",
    description:
      "They keep your child calm, focused, and confident through the most stressful year of their life.",
  },
  {
    role: "Dedicated Specialists",
    credential: "Whatever Your Child Needs",
    description:
      "Auditions, athletic recruitment, art portfolios, international applications. If your child needs it, we build it into the team.",
  },
];

const testimonials = [
  {
    logo: "/logos/harvard_mark.png",
    logoAlt: "Harvard",
    logoWidth: 212,
    logoHeight: 250,
    quote:
      '"When I first heard about Pegasus, I had already talked to a few other consultants, and they all sounded pretty similar.',
    more:
      ' What made the biggest difference was how personally invested Pegasus was in my success, maybe even more than me at times. They gave me a lot of advice, not just on school and applications but also on mindset and how to be more positive in life. That was really important for me because during admissions season, I was very scattered and nervous and scared, so having someone anchor me was very, very helpful."',
    attribution: "N.Z. — Harvard University Admit",
  },
  {
    logo: "/logos/nyu_torch.png",
    logoAlt: "NYU Stern",
    logoWidth: 300,
    logoHeight: 300,
    quote:
      '"Pegasus helped me overcome my fear of public speaking and helped me become more confident overall. It’s nice to know that super impressive people face the same challenges as me. It makes me believe I can achieve the impossible."',
    attribution: "R.W. — New York University, Stern School of Business Admit",
  },
  {
    logo: "/logos/penn_shield.png",
    logoAlt: "Penn",
    logoWidth: 250,
    logoHeight: 216,
    quote:
      "Before Pegasus, I was really lost in the admissions process. I didn’t know where to start, my SAT scores didn’t feel strong, and my first essay draft was honestly horrendous. I didn’t understand what Ivies cared about or how to make my writing personal.",
    more:
      ' Pegasus pushed me to think differently, gave me very specific feedback, and helped me get the hang of it much faster than I could on my own. They never wrote anything for me, but they pushed me to dream bigger and work harder. That shift in mindset made this feel possible. And I’m now heading to Penn."',
    attribution: "K.C. — University of Pennsylvania Admit",
  },
  {
    logo: "/logos/brown_shield.png",
    logoAlt: "Brown",
    logoWidth: 200,
    logoHeight: 256,
    quote:
      "This was absolutely fabulous! Pegasus allowed me to develop a more positive, action-oriented mindset. Initially, I would be hesitant about reaching out to individuals, but over time Pegasus helped me learn that the only way to break this fear was to just do it and seek rejections.",
    more: ' I can’t recommend this program enough!!"',
    attribution: "S.S. — Brown University Admit",
  },
  {
    logo: "/logos/dartmouth_coa.png",
    logoAlt: "Dartmouth",
    logoWidth: 142,
    logoHeight: 152,
    quote:
      "Working with Pegasus was great. They were quick to understand my needs and offer prompt help with my application. I’m super happy with how my letter turned out. It sounds authentic and real, and thanks to his help, I got in! 100% recommend this guy knows what’s up.",
    attribution: "P.M. — Dartmouth College Admit",
  },
  {
    logo: "/logos/nyu_torch.png",
    logoAlt: "NYU",
    logoWidth: 300,
    logoHeight: 300,
    quote:
      "I started working with Pegasus last year to help with my college essays, and honestly, without Pegasus, I don’t think I would’ve gotten anything done.",
    more:
      " Pegasus Education isn’t like those big tutoring companies where you’re just another student. It’s more like an exclusive program where every mentee gets insanely personalized treatment. You’re never just a number. You’re the main focus, and they work really hard to make sure your needs are heard and taken care of. The founder is kinda crazy — but in the best possible way. He checks in every two or three days to make sure you’re on track, and he’ll push you to get things done because he wants the best for you. I would highly recommend Pegasus.",
    attribution: "T.L. — New York University Admit",
  },
  {
    logo: "/logos/michigan_seal.png",
    logoAlt: "Michigan",
    logoWidth: 248,
    logoHeight: 248,
    quote:
      "The thing about Pegasus is that they actually care — like, more than a ‘business’ should. I remember being stressed out of my mind right before my work was due, and they were up with me until 3:00 AM. They wanted it to be perfect as much as I did. It felt like someone actually had my back.",
    more:
      ' You know how sometimes you hire someone and they just wait for you to do the work? Not here. Pegasus was constantly on me — “you gotta do this, don’t forget that.” There were times they cared more about my progress than I did that day! They keep you moving when you’re tired, which is exactly what you need when you’re a senior with a million things going on. My biggest advice? Take every session they offer. Even when I was swamped with schoolwork, if they called and said a spot opened up, I took it. It wasn’t just about the apps. It actually changed the way I speak and write in general. That kind of growth is honestly priceless."',
    attribution: "A.J. — University of Michigan Admit",
  },
  {
    logo: "/logos/cooper.png",
    logoAlt: "Cooper Union",
    logoWidth: 448,
    logoHeight: 644,
    quote:
      "I got into Cooper Union for Engineering and couldn’t have done it without Pegasus. Coming from a competitive NYC high school, I wasn’t confident that I stood out or that Cooper was even realistic, especially with a low SAT and no clear idea of what I should write about.",
    more:
      ' Working with Pegasus was completely different from working with a typical counselor. The mentors had actually been through the most competitive admissions processes themselves like Columbia, Yale, and Cornell. They brought that perspective into every detail. They were incredibly obsessive, fully invested in helping me win. The process was intense: late nights, holidays, constant iteration, and zero shortcuts. They had high integrity and never wrote anything for me, but they met as often as needed. They pushed me harder than my parents ever did, forcing me to be authentic, vulnerable, and intentional with my storytelling. At the same time, they pushed me to dream bigger, aim higher, and believe in myself when I didn’t. While Pegasus isn’t cheap, it’s absolutely worth it. I would highly recommend Pegasus to anyone aiming for the top or anyone who wants the strongest possible shot at college admissions."',
    attribution: "J.L. — The Cooper Union Admit",
  },
  {
    logo: "/logos/stanford_cropped.png",
    logoAlt: "Stanford",
    logoWidth: 340,
    logoHeight: 340,
    quote:
      'I loved Pegasus. It was an awesome experience, and I received tons of valuable feedback on my ideas. There was also a lot of mentorship, and I highly recommend it to anyone interested in entrepreneurship!"',
    attribution: "A.R. — Stanford University Admit",
  },
];

export default function Home() {
  return (
    <>
      <div id="top" />
      <SiteHeader />

      <main>
        <section className="hero-slim" aria-labelledby="hero-title">
          <div className="hero-tag">
            <span className="hero-tag-dot" />
            By Invitation &amp; Referral Only
          </div>
          <h1 className="hero-slim-title" id="hero-title">
            A Private Education Office <br /> for High Net Worth Families
          </h1>
          <p className="hero-slim-sub">
            We manage every aspect of the college application process—from strategy through
            enrollment.
          </p>
          <div className="hero-ctas">
            <BookingLink className="btn btn-lg">Schedule a Private Meeting</BookingLink>
            <a href="#testimonials" className="btn btn-lg btn-soft">
              See Results
            </a>
          </div>
        </section>

        <section className="videos-lead" aria-label="Student video testimonials">
          <div className="videos-grid">
            <article className="video-outer">
              <div className="video-embed">
                <iframe
                  src="https://www.loom.com/embed/30947e99fe3b427982f3d5b5056243bb?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&hide_speed=true"
                  title="Parsons School of Design student testimonial"
                  allowFullScreen
                />
              </div>
              <div className="video-meta">
                <span className="video-label">Student Testimonial</span>
                <span className="video-school-pill">Parsons School of Design</span>
              </div>
            </article>

            <article className="video-outer">
              <div className="video-embed">
                <iframe
                  src="https://www.loom.com/embed/922f80bbb07b4a88b302a7419ec6fd4f?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&hide_speed=true"
                  title="University of Pennsylvania student testimonial"
                  allowFullScreen
                />
              </div>
              <div className="video-meta">
                <span className="video-label">Student Testimonial</span>
                <span className="video-school-pill">University of Pennsylvania</span>
              </div>
            </article>
          </div>
        </section>

        <hr className="divider" />

        <section className="testimonials-wrap" id="testimonials">
          <div className="testimonials">
            <header className="t-header">
              <p className="section-label">Our Approach</p>
              <h2 className="section-heading">
                A private team,
                <br />
                around your child.
              </h2>
              <p className="team-oneline">
                Carefully assembled for your child, and accountable for the outcome.
              </p>

              <div className="team-grid">
                {team.map((member) => (
                  <article className="team-card" key={member.role}>
                    <h3 className="team-card-role">{member.role}</h3>
                    <p className="team-card-cred">{member.credential}</p>
                    <p className="team-card-desc">{member.description}</p>
                  </article>
                ))}
              </div>

              <p className="team-price">Most families invest approximately US$150,000.</p>
            </header>

            <article className="featured">
              <blockquote>
                “I didn’t think she had a shot at an Ivy. They work weekends, holidays, even
                Thanksgiving. They didn’t just help with college admissions — they helped my
                daughter believe in herself. And that is priceless.”
              </blockquote>
              <div className="featured-bottom">
                <div className="featured-attr">Parent — Daughter Admitted</div>
                <div className="featured-school-badge">University of Pennsylvania</div>
              </div>
            </article>

            <div className="t-editorial">
              {testimonials.map((testimonial) => (
                <Testimonial key={testimonial.attribution} {...testimonial} />
              ))}
            </div>
          </div>
        </section>

        <section className="about-section" aria-labelledby="about-name">
          <div className="about-photo-wrap">
            <Image
              src="/jeffrey.png"
              alt="Jeffrey Zhang"
              className="about-photo"
              width={1194}
              height={1317}
              sizes="(max-width: 900px) 100vw, 42vw"
            />
          </div>
          <div className="about-content">
            <h2 className="about-name" id="about-name">
              Jeffrey Zhang
            </h2>
            <p className="about-title">Founder, Pegasus Education</p>
            <div className="about-text">
              <p>
                I built Pegasus not just to help students get into elite universities. I believe
                young people are capable of far more than they realize.
              </p>
              <p className="about-kicker">
                I want every student I work with to become exceptional — to think clearly,
                reflect honestly, communicate powerfully, act courageously, and pursue the most
                ambitious version of themselves.
              </p>
            </div>
            <div className="about-rule" />
            <a
              href="https://www.linkedin.com/in/bobajef/"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8.02h4.56V24H.22V8.02zm7.6 0h4.37v2.18h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 7v9.16h-4.56v-8.12c0-1.94-.03-4.43-2.7-4.43-2.7 0-3.11 2.11-3.11 4.29V24H7.82V8.02z" />
              </svg>
              Connect on LinkedIn
            </a>
          </div>
        </section>

        <section className="cta-section" aria-label="Schedule a private meeting">
          <BookingLink className="btn btn-lg">Schedule a Private Meeting</BookingLink>
          <div className="cta-contacts">
            <a href="mailto:admissions@pegasusprep.education" className="cta-contact-item">
              admissions@pegasusprep.education
            </a>
            <div className="cta-divider" />
            <a href="tel:+19178552330" className="cta-contact-item">
              917-855-2330
            </a>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-left">
          <BrandMark className="footer-mark" />
          <span className="footer-name">Pegasus Education</span>
        </div>
      </footer>

      <div className="cta-sticky">
        <BookingLink className="btn">Schedule a Private Meeting</BookingLink>
      </div>
    </>
  );
}
