import { FC } from 'react';

interface SpinnerProps {
  className?: string;
}

export const Spinner: FC<SpinnerProps> = ({ className = '' }) => {
  return (
    <div className={`flex justify-center p-4 ${className}`}>
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Loading...
        </span>
      </div>
    </div>
  );
};