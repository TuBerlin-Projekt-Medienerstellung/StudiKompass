import React from 'react'
import SemesterCard from "@/components/semester-card";
import PlannerTitleEasterEgg from "@/components/planner-title-easter-egg";

const Page = () => {
    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <PlannerTitleEasterEgg />
                <p className="text-muted-foreground">Plane dein Studium semesterweise</p>
            </div>
            <SemesterCard/>
        </section>
    )
}
export default Page
