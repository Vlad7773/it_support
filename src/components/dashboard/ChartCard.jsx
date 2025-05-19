import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ChartCard = ({ title, subtitle, data, type = 'line' }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#a1a1aa',
          font: {
            family: 'Roboto',
          },
        },
      },
      tooltip: {
        backgroundColor: '#25262b',
        titleColor: '#ffffff',
        bodyColor: '#a1a1aa',
        borderColor: '#2c2e33',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#2c2e33',
        },
        ticks: {
          color: '#a1a1aa',
        }
      },
      y: {
        grid: {
          color: '#2c2e33',
        },
        ticks: {
          color: '#a1a1aa',
        }
      }
    }
  };

  return (
    <div className="bg-dark-card rounded-lg shadow-card p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-sm text-dark-textSecondary">{subtitle}</p>}
      </div>
      <div className="h-48">
        {type === 'line' ? (
          <Line data={data} options={chartOptions} />
        ) : (
          <Bar data={data} options={chartOptions} />
        )}
      </div>
    </div>
  );
};

export default ChartCard; 