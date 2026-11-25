<Dashboard
  username={user.name}
  streak={user.streak}
  xp={user.xp}
  overallProgress={progress.percentage}
  completedLessons={progress.completed}
  totalLessons={progress.total}
  dailyGoalCompleted={dailyProgress.completed}
  dailyGoal={dailyProgress.target}
  courses={courses}
  currentCourse={currentCourse}
  onNavigate={(page) => navigateTo(page)}
  onContinue={(course) => openLesson(course)}
  onOpenCourse={(course) => openCourse(course)}
  onUpgrade={() => navigateTo("premium")}
/>
