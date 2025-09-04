function Star({ filledPercent = 0 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2l2.9 6.6 7.1.6-5.3 4.6 1.6 7-6.3-3.8-6.3 3.8 1.6-7-5.3-4.6 7.1-.6L12 2z"
        fill="#d1d5db" /* gray-300 */
      />
      <path
        d="M12 2l2.9 6.6 7.1.6-5.3 4.6 1.6 7-6.3-3.8-6.3 3.8 1.6-7-5.3-4.6 7.1-.6L12 2z"
        fill="gold"
        style={{ clipPath: `inset(0 ${100 - filledPercent}% 0 0)` }}
      />
    </svg>
  );
}

export default function Stars({ rating=0 }) {
  return (
    <div className="flex ">
      {[...Array(5)].map((_, i) => {
        const percent = Math.min(Math.max(rating - i, 0), 1) * 100;
        return <Star key={i} filledPercent={percent} />;
      })}
    </div>
  );
}