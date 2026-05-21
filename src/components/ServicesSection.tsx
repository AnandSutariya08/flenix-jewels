import { Settings, Award, Users, Truck, Globe, Headphones } from "lucide-react";

const services = [
  {
    icon: Settings,
    title: "Customization",
    desc: "Made-to-order designs with expert guidance.",
  },
  {
    icon: Award,
    title: "Certified Quality",
    desc: "Trusted grading and lifetime authenticity.",
  },
  {
    icon: Users,
    title: "Free Consultation",
    desc: "Personal assistance for the perfect pick.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Secure, insured shipping to your door.",
  },
  {
    icon: Globe,
    title: "Worldwide Shipping",
    desc: "15+ countries served with tracking.",
  },
  {
    icon: Headphones,
    title: "After-Sales Support",
    desc: "Care, resizing, and ongoing help.",
  },
];

const ServicesSection = () => {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-[10px] tracking-[0.35em] uppercase font-black text-primary mb-3">
            Services
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Our Best Service <span className="text-primary">For You</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            From custom design to secure worldwide delivery — we make every step
            effortless.
          </p>
          <div
            className="mt-6 mx-auto h-px w-28"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(196,144,106,0.9), transparent)",
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <div
              key={index}
              className="group rounded-2xl border bg-background/80 backdrop-blur-sm p-6 md:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                borderColor: "rgba(196,144,106,0.16)",
                boxShadow: "0 8px 40px -18px rgba(0,0,0,0.25)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                  style={{
                    background: "rgba(196,144,106,0.10)",
                    border: "1px solid rgba(196,144,106,0.22)",
                  }}
                >
                  <service.icon
                    className="h-5 w-5 text-primary"
                    strokeWidth={1.6}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base md:text-lg font-bold tracking-tight text-foreground mb-1">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
