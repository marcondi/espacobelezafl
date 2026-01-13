import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CategoryExpense } from '@/types';

interface ExpenseChartProps {
  data: CategoryExpense[];
}

export default function ExpenseChart({ data }: ExpenseChartProps) {
  const chartData = data.map(item => ({
    name: item.category,
    value: item.amount
  }));

  const colors = [
    'hsl(158 64% 42%)',
    'hsl(158 84% 52%)',
    'hsl(0 72% 51%)',
    'hsl(210 100% 45%)',
    'hsl(158 64% 62%)',
    'hsl(0 72% 71%)'
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(value as number)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
