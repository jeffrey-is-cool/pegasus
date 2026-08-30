type VideoTestimonialProps = {
  embedUrl: string;
  school: string;
};

export function VideoTestimonial({ embedUrl, school }: VideoTestimonialProps) {
  return (
    <article className="video-outer ds-surface ds-surface--deep ds-surface--accented ds-surface--media">
      <div className="video-embed">
        <iframe
          src={embedUrl}
          title={`${school} student testimonial`}
          allowFullScreen
          suppressHydrationWarning
        />
      </div>
      <div className="video-meta">
        <span className="video-label ds-eyebrow ds-eyebrow--inverse ds-eyebrow--compact">
          Student Testimonial
        </span>
        <span className="video-school-pill">{school}</span>
      </div>
    </article>
  );
}
