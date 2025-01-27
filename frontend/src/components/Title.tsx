// src/components/Title.tsx
type TitleProps = {
  children: React.ReactNode;
  className?: string;
};

const Title = ({ children, className = "" }: TitleProps) => {
  return (
    <h1
      className={`text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent drop-shadow-sm  transition-transform duration-200 ${className}`}
    >
      {children}
    </h1>
  );
};

export default Title;
