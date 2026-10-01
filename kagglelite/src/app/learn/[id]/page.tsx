'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, PlayCircle } from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const fetchCourse = () => {
    fetch(`/api/courses/${id}`)
      .then(res => res.json())
      .then(data => {
        if(data.course) {
          setCourse(data.course);
          setProgress(data.progress);
        }
      });
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  if (!course) return <div className="py-10 text-center">Loading...</div>;

  const markComplete = async () => {
    const res = await fetch(`/api/courses/${id}/complete`, { method: 'POST' });
    if (res.ok) {
      fetchCourse();
    } else if (res.status === 401) {
      router.push('/login');
    }
  };

  const pct = Math.round((progress / course.lessons_count) * 100);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white p-8 rounded-2xl border border-kaggle-border shadow-sm mb-8">
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        <p className="text-gray-600 mb-6">{course.description}</p>
        
        <div className="mb-2 flex justify-between text-sm font-bold text-gray-700">
          <span>Your Progress</span>
          <span>{pct}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${pct}%` }}></div>
        </div>

        <div className="flex gap-4">
          <button onClick={markComplete} disabled={progress >= course.lessons_count} className="bg-green-500 text-white px-6 py-2 rounded-full font-bold hover:bg-opacity-90 disabled:opacity-50 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" /> Mark Lesson Complete
          </button>
          <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-full font-bold hover:bg-gray-50 flex items-center gap-2">
            <PlayCircle className="h-5 w-5" /> Continue
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Lessons</h2>
      <div className="flex flex-col gap-4">
        {Array.from({ length: course.lessons_count }).map((_, i) => (
          <div key={i} className={`p-4 rounded-xl border flex items-center justify-between ${i < progress ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i < progress ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i + 1}
              </div>
              <span className={`font-medium ${i < progress ? 'text-green-800' : 'text-gray-700'}`}>Lesson {i + 1}</span>
            </div>
            {i < progress && <CheckCircle className="h-5 w-5 text-green-500" />}
          </div>
        ))}
      </div>
    </div>
  );
}
