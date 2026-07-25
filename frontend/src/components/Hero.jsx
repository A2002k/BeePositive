import {
  ArrowRight,
  Leaf,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import heroSunrise from "/assets/images/hero-sunrise.png";

function Hero() {
  const features = [
    {
      icon: Leaf,
      title: "100% Natural",
      description: "No additives or preservatives",
    },
    {
      icon: Sparkles,
      title: "Raw & Pure",
      description: "Unfiltered natural honey",
    },
    {
      icon: Leaf,
      title: "Rich in Nutrients",
      description: "Goodness for your family",
    },
    {
      icon: PackageCheck,
      title: "Fast Delivery",
      description: "Delivered across Lebanon",
    },
  ];

  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-88px)] overflow-hidden bg-[#100b06]"
    >
      <img
        src={heroSunrise}
        alt="BeePositive natural honey"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/35" />

      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-black/10" />

      <div className="absolute inset-0 bg-gradient-to-t from-[#100b06] via-transparent to-black/20" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-[1500px] flex-col px-6 pb-8 pt-24 lg:px-12 lg:pt-28">
        <div className="flex flex-1 items-center">
          <motion.div
            initial={{
              opacity: 0,
              x: -50,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.9,
              ease: "easeOut",
            }}
            className="max-w-3xl"
          >
            <motion.p
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.25,
                duration: 0.7,
              }}
              className="mb-5 text-xs font-bold uppercase tracking-[0.4em] text-amber-400 sm:text-sm"
            >
              From our beehives to your home
            </motion.p>

            <motion.h1
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.4,
                duration: 0.8,
              }}
              className="font-serif text-5xl font-bold leading-[0.94] text-white sm:text-6xl lg:text-[60px]"
            >
              Pure Honey,

              <span className="mt-3 block bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                Positive Life
              </span>
            </motion.h1>

            <motion.div
              initial={{
                opacity: 0,
                scaleX: 0,
              }}
              animate={{
                opacity: 1,
                scaleX: 1,
              }}
              transition={{
                delay: 0.65,
                duration: 0.7,
              }}
              className="my-7 h-px w-44 origin-left bg-gradient-to-r from-amber-400 to-transparent"
            />

            <motion.p
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.75,
                duration: 0.7,
              }}
              className="max-w-xl text-base leading-8 text-white/72 sm:text-lg"
            >
              Discover authentic honey harvested with care,
              preserved naturally, and delivered directly from
              our beehives to your home.
            </motion.p>

            <motion.div
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.95,
                duration: 0.7,
              }}
              className="mt-9 flex flex-wrap gap-4"
            >
              <Link
                to="/products"
                className="group flex items-center gap-3 rounded-lg bg-amber-500 px-7 py-4 font-semibold text-black shadow-xl shadow-amber-500/20 transition hover:-translate-y-1 hover:bg-amber-400"
              >
                View Shop

                <ArrowRight
                  size={20}
                  className="transition group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/#story"
                className="group flex items-center gap-3 rounded-lg border border-white/40 bg-black/20 px-7 py-4 font-semibold text-white backdrop-blur-sm transition hover:-translate-y-1 hover:border-amber-400 hover:bg-white/10"
              >
                Our Story

                <ArrowRight
                  size={20}
                  className="transition group-hover:translate-x-1"
                />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="mt-14 w-full">
          <div className="grid overflow-hidden rounded-2xl border border-white/10 bg-[#17110c]/90 shadow-2xl shadow-black/40 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{
                    opacity: 0,
                    y: 25,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 1.1 + index * 0.12,
                    duration: 0.6,
                  }}
                  className="flex items-center gap-4 border-b border-white/10 px-6 py-5 last:border-b-0 sm:nth-[2]:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-400">
                    <Icon
                      size={23}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      {feature.title}
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-white/55">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;