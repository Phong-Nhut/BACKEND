import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <div className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center text-center bg-gradient-to-r from-blue-100 to-purple-100">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/30" />
      <motion.div
        className="relative z-10 max-w-3xl px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 sm:text-5xl md:text-6xl">
          Discover Your Next Game Asset
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Explore a universe of game assets crafted by talented creators. Find sprites, music, and more for your next project.
        </p>
        <div className="mt-10">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
            <a href="#latest-games">Explore Assets</a>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
