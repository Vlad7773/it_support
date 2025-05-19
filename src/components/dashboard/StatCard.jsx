import React from 'react';

const StatCard = ({ title, value, color, icon: Icon, change }) => {
  const colorClasses = {
    red: 'border-red-500 text-red-500',
    blue: 'border-blue-500 text-blue-500',
    orange: 'border-orange-500 text-orange-500',
    green: 'border-green-500 text-green-500',
  };

  return (
    <div className="bg-dark-card rounded-lg shadow-card hover:shadow-card-hover transition-all transform hover:-translate-y-1 border border-dark-border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-dark-textSecondary">{title}</h3>
          {Icon && <Icon className={`w-6 h-6 ${colorClasses[color]}`} />}
        </div>
        <div className="flex items-end justify-between">
          <p className="text-3xl font-bold text-white">{value}</p>
          {change && (
            <span className={`text-sm font-medium ${
              change > 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard; 