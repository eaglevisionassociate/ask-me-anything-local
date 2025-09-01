import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ExerciseListProps {
  lessonId?: string;
  onExerciseSelect?: (exercise: any) => void;
}

export const ExerciseListMinimal = ({ lessonId, onExerciseSelect }: ExerciseListProps) => {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Math Exercises</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a minimal test component to debug the React hook issue.</p>
          <p>Selected: {selectedExercise || 'none'}</p>
          <button onClick={() => setSelectedExercise('test')}>
            Test useState
          </button>
        </CardContent>
      </Card>
    </div>
  );
};