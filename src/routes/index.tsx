import React from 'react';
import DailyJournal from '../pages/DailyJournal';

const HomePage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Personal Journal</h1>
      <DailyJournal />
    </div>
  );
};

export default HomePage;