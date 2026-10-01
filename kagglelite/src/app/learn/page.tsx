'use client';
import { useEffect, useState } from 'react';

export default function Learn() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data.courses || []));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learn</h1>
        <p className="text-gray-600 text-lg">Gain the skills you need to do independent data science projects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course: any) => (
          <div key={course.id} className="bg-white p-6 rounded-2xl border border-kaggle-border shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex-grow">
              <h3 className="font-bold text-xl mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{course.description}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">{course.lessons_count} lessons</span>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors">Start</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
