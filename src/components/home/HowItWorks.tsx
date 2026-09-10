import { motion } from "framer-motion";
import { Search, Calendar, CreditCard, PartyPopper } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Discover Artists",
    description: "Browse through our curated collection of verified traditional artists from all over India.",
  },
  {
    icon: Calendar,
    title: "Check Availability",
    description: "View real-time availability and select your preferred date for the performance.",
  },
  {
    icon: CreditCard,
    title: "Book & Pay Securely",
    description: "Complete your booking with our secure payment gateway. Get instant confirmation.",
  },
  {
    icon: PartyPopper,
    title: "Enjoy the Performance",
    description: "Connect with your artist and experience an authentic cultural celebration.",
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-secondary py-16 text-secondary-foreground md:py-24">
      <div className="container">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-2 inline-block text-sm font-medium uppercase tracking-wider text-primary"
          >
            Simple Process
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-4 font-display text-3xl font-bold md:text-4xl"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-secondary-foreground/80"
          >
            Book your favorite traditional artist in just a few simple steps. 
            We handle everything so you can focus on your celebration.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative text-center"
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-10 hidden h-0.5 w-full bg-gradient-to-r from-primary/50 to-transparent lg:block" />
              )}
              
              {/* Step Number */}
              <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-saffron opacity-20" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-saffron">
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                  {index + 1}
                </span>
              </div>

              <h3 className="mb-2 font-display text-xl font-semibold">{step.title}</h3>
              <p className="text-sm text-secondary-foreground/70">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
