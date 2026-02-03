import { StudyForm } from "@/components/StudyForm";


export default function AddStudy() {
  return (
    <div className="w-full">

      <div className="mx-auto max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Log Your Study Session
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track your learning progress and build your streak! 📚
          </p>
        </div>
        <StudyForm />
      </div>
    </div>

  );
}
