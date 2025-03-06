import { motion } from "motion/react";
import { cn } from "@/lib/utils.ts";

function getRandomSize() {
  const sizes = [
    "sm:size-16",
    "sm:size-18",
    "sm:size-20",
    "sm:size-22",
    "sm:size-24",
  ];
  return sizes[Math.floor(Math.random() * sizes.length)];
}

function getRandomRotationDelta() {
  return Math.floor(Math.random() * 40) - 20;
}

function getRandomRotationPositionDelta() {
  return Math.floor(Math.random() * 40) - 20;
}

function getRandomDelayAndDuration() {
  return Math.random() * 0.5 + 0.3;
}

const CoinsSpread = () => {
  return (
    <div className={"inset-0"} id={"spread"}>
      <div className="absolute inset-x-0 -top-30 -z-1">
        <motion.img
          initial={{ x: 0, y: 100, opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: getRandomRotationPositionDelta(),
            y: getRandomRotationPositionDelta(),
            rotate: getRandomRotationDelta(),
          }}
          whileHover={{ scale: 1.2 }}
          transition={{
            delay: getRandomDelayAndDuration(),
            duration: getRandomDelayAndDuration(),
            scale: { type: "tween", visualDuration: 0.4, bounce: 0.5 },
          }}
          src={"/algorand-coin.png"}
          className={cn("rounded-full, inline-block size-10", getRandomSize())}
        />
      </div>
      <div className="absolute top-0 left-0">
        <motion.img
          initial={{ x: 100, y: 100, opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: getRandomRotationPositionDelta(),
            y: getRandomRotationPositionDelta(),
            rotate: -45 + getRandomRotationDelta(),
          }}
          whileHover={{ scale: 1.2 }}
          transition={{
            delay: getRandomDelayAndDuration(),
            duration: getRandomDelayAndDuration(),
            scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
          }}
          src={"/algorand-coin.png"}
          className={cn("inline-block size-10 rounded-full", getRandomSize())}
        />
      </div>
      <div className="absolute top-0 right-0">
        <motion.img
          initial={{ x: -100, y: 100, opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: getRandomRotationPositionDelta(),
            y: getRandomRotationPositionDelta(),
            rotate: 45 + getRandomRotationDelta(),
          }}
          whileHover={{ scale: 1.2 }}
          transition={{
            delay: getRandomDelayAndDuration(),
            duration: getRandomDelayAndDuration(),
            scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
          }}
          src={"/algorand-coin.png"}
          className={cn("inline-block size-10 rounded-full", getRandomSize())}
        />
      </div>
      <div className="absolute bottom-0 left-0 hidden sm:block">
        <motion.img
          initial={{ x: 100, y: -100, opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: getRandomRotationPositionDelta(),
            y: getRandomRotationPositionDelta(),
            rotate: -135 + getRandomRotationDelta(),
          }}
          whileHover={{ scale: 1.2 }}
          transition={{
            delay: getRandomDelayAndDuration(),
            duration: getRandomDelayAndDuration(),
            scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
          }}
          src={"/algorand-coin.png"}
          className={cn("inline-block size-10 rounded-full", getRandomSize())}
        />
      </div>
      <div className="absolute right-0 bottom-0 hidden sm:block">
        <motion.img
          initial={{ x: -100, y: -100, opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: getRandomRotationPositionDelta(),
            y: getRandomRotationPositionDelta(),
            rotate: 135 + getRandomRotationDelta(),
          }}
          whileHover={{ scale: 1.2 }}
          transition={{
            delay: getRandomDelayAndDuration(),
            duration: getRandomDelayAndDuration(),
            scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
          }}
          src={"/algorand-coin.png"}
          className={cn("inline-block size-10 rounded-full", getRandomSize())}
        />
      </div>
      <div className="absolute inset-x-0 -bottom-30 hidden sm:block">
        <motion.img
          initial={{ x: 0, y: -100, opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: getRandomRotationPositionDelta(),
            y: getRandomRotationPositionDelta(),
            rotate: 180 + getRandomRotationDelta(),
          }}
          whileHover={{ scale: 1.2 }}
          transition={{
            delay: getRandomDelayAndDuration(),
            duration: getRandomDelayAndDuration(),
            scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
          }}
          src={"/algorand-coin.png"}
          className={cn("inline-block size-10 rounded-full", getRandomSize())}
        />
      </div>
    </div>
  );
};

export default CoinsSpread;
