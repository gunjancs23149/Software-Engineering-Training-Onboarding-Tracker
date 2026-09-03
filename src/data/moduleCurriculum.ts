import { ModuleCurriculum } from '../types';

export const MODULE_CURRICULA: Record<string, ModuleCurriculum> = {
  'mod-git': {
    moduleId: 'mod-git',
    sections: [
      {
        id: 'intro',
        title: '1. Introduction to Version Control & Git Flow',
        type: 'intro',
        duration: '15 mins',
        content: `### Welcome to Git & GitHub Fundamentals! 🚀

Git is the foundation of our engineering collaboration at OnboardPro. In this module, you will master our **Trunk-Based Development** workflow, commit standards, interactive rebasing, and effective Pull Request hygiene.

#### Why This Module Matters:
- **Clean Git History**: Well-structured atomic commits make rollbacks, bisects, and code reviews effortless.
- **Merge Conflict Prevention**: Frequent syncing with \`origin/main\` prevents drift and large, painful conflict resolutions.
- **Enterprise Standards**: We use Semantic Versioning and Conventional Commits to automate changelog generation and CI release tags.

Let’s review the key tools you’ll use: GitHub Enterprise, \`git CLI\`, and GPG commit signing.`,
      },
      {
        id: 'objectives',
        title: '2. Learning Objectives & Prerequisites',
        type: 'objectives',
        duration: '10 mins',
        content: `### 🎯 What You Will Accomplish:

By the end of this module, you will be able to:
1. **Branch Management**: Create standardized branch names (\`feat/PRO-123-short-desc\`, \`fix/PRO-456-bug\`).
2. **Interactive Rebasing**: Squash and reword local commit history before opening a PR using \`git rebase -i HEAD~N\`.
3. **Merge Conflict Resolution**: Safely resolve multi-file conflicts and continue rebase operations without losing upstream work.
4. **Pull Request Hygiene**: Author PRs with concise summaries, reproduction steps, screenshots/GIFs, and unit test logs.
5. **GPG Signing**: Ensure 100% of your commits carry the GitHub "Verified" badge.`,
      },
      {
        id: 'resource',
        title: '3. Video & Interactive Walkthrough',
        type: 'resource',
        duration: '35 mins',
        videoTitle: 'Mastering Git Rebase & Trunk-Based Collaboration (Enterprise Guide)',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Clean embedded video placeholder with fallback player UI
        content: `### 📺 Key Takeaways from the Video Walkthrough:

- **Always rebase onto main before pushing:**
  \`\`\`bash
  git checkout main
  git pull origin main
  git checkout feat/my-branch
  git rebase main
  \`\`\`
- **Interactive Rebase Commands cheat sheet:**
  - \`pick\` (\`p\`): Keep commit as is
  - \`reword\` (\`r\`): Keep commit but edit message
  - \`edit\` (\`e\`): Pause rebase to amend files/commit
  - \`squash\` (\`s\`): Meld into previous commit and combine messages
  - \`fixup\` (\`f\`): Meld into previous commit and discard message
  - \`drop\` (\`d\`): Remove the commit entirely`,
      },
      {
        id: 'docs',
        title: '4. Documentation & Standards Guide',
        type: 'docs',
        duration: '30 mins',
        content: `### 📖 OnboardPro Conventional Commit Specification

All commit messages in repositories must strictly follow this structure:

\`\`\`
<type>(<scope>): <short imperative summary>

[optional detailed body explaining WHY, not what]

[optional footer(s) like Closes #123, BREAKING CHANGE: ...]
\`\`\`

#### Allowed Types:
| Type | Usage |
| :--- | :--- |
| **\`feat\`** | A new user-facing feature or API capability |
| **\`fix\`** | A bug fix |
| **\`refactor\`** | Code change that neither fixes a bug nor adds a feature |
| **\`test\`** | Adding or correcting unit/integration tests |
| **\`chore\`** | Build system, dependency updates, tooling configs |
| **\`docs\`** | Documentation only changes |

#### Branch Naming Standard:
- \`feat/ENG-104-user-profile-endpoint\`
- \`fix/ENG-209-null-pointer-in-auth-middleware\`
- \`chore/ENG-312-upgrade-typescript-5\`
`,
      },
      {
        id: 'task',
        title: '5. Practical Hands-on Tasks',
        type: 'task',
        duration: '45 mins',
        content: 'Complete each of the hands-on terminal tasks below. Check them off once executed in your local sandbox.',
        tasks: [
          {
            id: 'task-1',
            title: 'Configure Git Global Identity & Signing',
            description: 'Run commands to set your official company email, name, and default branch to main.',
            codeSnippet: `git config --global user.name "Your Full Name"
git config --global user.email "your.name@onboardpro.dev"
git config --global init.defaultBranch main
git config --global pull.rebase true`,
            isCompleted: false,
            hint: 'Verify with `git config --list --show-origin`',
          },
          {
            id: 'task-2',
            title: 'Create a Feature Branch and 3 Atomic Commits',
            description: 'Create branch `feat/onboarding-demo`, add 3 separate files, and commit each with conventional format.',
            codeSnippet: `git checkout -b feat/onboarding-demo
echo "console.log('hello')" > index.js
git commit -am "feat(core): initialize sandbox script"`,
            isCompleted: false,
          },
          {
            id: 'task-3',
            title: 'Squash 3 Commits into 1 via Interactive Rebase',
            description: 'Run `git rebase -i HEAD~3` and squash the last two commits into the first with a clean single commit message.',
            codeSnippet: `git rebase -i HEAD~3
# In editor, mark line 2 & 3 as 'fixup' or 'squash'`,
            isCompleted: false,
          },
          {
            id: 'task-4',
            title: 'Simulate and Resolve a 3-way Merge Conflict',
            description: 'Create a conflicting branch edit, merge, resolve markers, and finalize with git add & git commit.',
            codeSnippet: `git merge main
# Open conflicting file, resolve <<<<<<< HEAD markers
git add .
git commit -m "chore(merge): resolve main branch conflicts"`,
            isCompleted: false,
          },
        ],
      },
      {
        id: 'quiz',
        title: '6. Knowledge Check Quiz',
        type: 'quiz',
        duration: '15 mins',
        quizQuestions: [
          {
            id: 'q1',
            question: 'What is the primary benefit of running `git pull --rebase origin main` over a regular `git pull`?',
            options: [
              'It encrypts your code repository.',
              'It prevents unsightly non-linear merge commits and keeps branch history linear.',
              'It forces remote repository to accept untested changes.',
              'It deletes unstaged files.',
            ],
            correctIndex: 1,
            explanation: 'Rebase pulls upstream changes and replays your local work sequentially on top, preserving a clean history graph.',
          },
          {
            id: 'q2',
            question: 'Which interactive rebase directive discards the commit message of an intermediate commit and squashes its changes into the previous commit?',
            options: ['squash (s)', 'fixup (f)', 'reword (r)', 'edit (e)'],
            correctIndex: 1,
            explanation: '`fixup` merges the change into the previous commit while automatically discarding the intermediate commit’s message.',
          },
          {
            id: 'q3',
            question: 'How should a breaking API change be annotated in Conventional Commits?',
            options: [
              'Prefix with `break:`',
              'Include an exclamation mark after type/scope (e.g., `feat(api)!:`) or mention `BREAKING CHANGE:` in the footer.',
              'Include [MAJOR] in all caps.',
              'Submit the PR without review.',
            ],
            correctIndex: 1,
            explanation: '`!` after the type/scope or `BREAKING CHANGE:` footer triggers SemVer major releases.',
          },
        ],
      },
      {
        id: 'assessment',
        title: '7. Final Assessment & Certification',
        type: 'assessment',
        duration: '15 mins',
        content: `### 🎓 Final Assessment

You are now ready to take the official **Git Fundamentals & Branching Assessment**.
- **Passing Score**: 70%
- **Time Limit**: 15 minutes
- **Questions**: 10 questions
- **Reward**: 150 XP + **Git Master** Badge

Click the **"Take Assessment"** button below to begin.`,
      },
    ],
  },
  'mod-docker': {
    moduleId: 'mod-docker',
    sections: [
      {
        id: 'intro',
        title: '1. Introduction to Docker & Microservice Containers',
        type: 'intro',
        duration: '20 mins',
        content: `### Welcome to Docker & Containerization in Production! 🐳

Containers package applications together with all their runtime dependencies, ensuring consistent execution across development laptops, staging clusters, and production Kubernetes pods.

#### Key Focus Areas:
1. **Multi-Stage Builds**: Keeping images under 100MB by excluding compilers.
2. **Container Security**: Non-root users, least-privilege permissions, read-only root filesystems.
3. **Docker Compose**: Orchestrating backend, database, Redis cache, and mock services locally.`,
      },
      {
        id: 'objectives',
        title: '2. Learning Objectives & Prerequisites',
        type: 'objectives',
        duration: '10 mins',
        content: `### 🎯 What You Will Learn:
1. Write production-ready, cached Dockerfiles.
2. Create isolated Docker networks and manage persistent volumes.
3. Compose polyglot microservice environments locally with a single \`docker compose up\`.
4. Scan and remediate container security vulnerabilities using Trivy.`,
      },
      {
        id: 'resource',
        title: '3. Video & Containerization Architecture',
        type: 'resource',
        duration: '40 mins',
        videoTitle: 'Multi-Stage Dockerfiles & Secure Containerization Best Practices',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        content: `### 💡 Container Best Practices Summary:
- **Layer Order:** Place instructions that change infrequently (like \`COPY package*.json\`) before frequently changing instructions (\`COPY . .\`).
- **Use .dockerignore:** Always exclude \`node_modules\`, \`.git\`, \`.env\`, and test artifacts.
- **Run as non-root:** Always create a system user:
  \`\`\`dockerfile
  RUN addgroup -S appgroup && adduser -S appuser -G appgroup
  USER appuser
  \`\`\``,
      },
      {
        id: 'docs',
        title: '4. Production Dockerfile Template',
        type: 'docs',
        duration: '25 mins',
        content: `### 📦 Official OnboardPro Multi-Stage Dockerfile Template

\`\`\`dockerfile
# Stage 1: Build Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# Stage 2: Compilation & Assets
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --production

# Stage 3: Lean Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/main.js"]
\`\`\``,
      },
      {
        id: 'task',
        title: '5. Practical Hands-on Tasks',
        type: 'task',
        duration: '50 mins',
        content: 'Complete the local containerization tasks below:',
        tasks: [
          {
            id: 'task-1',
            title: 'Build Multi-Stage Image',
            description: 'Build the multi-stage Docker image and verify that the final size is below 90MB.',
            codeSnippet: `docker build -t onboardpro-app:latest .
docker images | grep onboardpro-app`,
            isCompleted: false,
          },
          {
            id: 'task-2',
            title: 'Launch Docker Compose Stack',
            description: 'Run Docker Compose with backend, PostgreSQL, and Redis containers on a shared bridge network.',
            codeSnippet: `docker compose up -d
docker compose ps`,
            isCompleted: false,
          },
          {
            id: 'task-3',
            title: 'Verify Non-Root User Execution',
            description: 'Exec into running container and verify `whoami` returns non-root user (id != 0).',
            codeSnippet: `docker exec -it <container_id> whoami`,
            isCompleted: false,
          },
        ],
      },
      {
        id: 'quiz',
        title: '6. Knowledge Check Quiz',
        type: 'quiz',
        duration: '15 mins',
        quizQuestions: [
          {
            id: 'qd1',
            question: 'Why should `USER` directive be specified in production Dockerfiles?',
            options: [
              'To assign ownership of the laptop to Docker.',
              'To ensure the application process does not run as root, mitigating container breakout threats.',
              'To speed up download speeds.',
              'To allow automatic sudo escalation.',
            ],
            correctIndex: 1,
            explanation: 'Running non-root is a fundamental security requirement to restrict container privileges.',
          },
          {
            id: 'qd2',
            question: 'How do services in the same Docker Compose network discover each other?',
            options: [
              'Using dynamic IP scanning.',
              'Via Docker’s internal DNS using service names as hostnames.',
              'By connecting to localhost on the host machine.',
              'Through cloud DNS servers.',
            ],
            correctIndex: 1,
            explanation: 'Docker embeds an internal DNS server that resolves service names defined in `compose.yml`.',
          },
        ],
      },
      {
        id: 'assessment',
        title: '7. Final Assessment',
        type: 'assessment',
        duration: '20 mins',
        content: `### 🎓 Final Assessment

You are now ready to take the **Docker & Microservices Containerization Assessment**.
- **Passing Score**: 75%
- **Time Limit**: 20 minutes
- **Questions**: 8 questions
- **Reward**: 150 XP + **Docker Beginner** Badge`,
      },
    ],
  },
  'mod-testing': {
    moduleId: 'mod-testing',
    sections: [
      {
        id: 'intro',
        title: '1. Introduction to Software Testing & TDD',
        type: 'intro',
        duration: '20 mins',
        content: `### Welcome to Software Testing & TDD Fundamentals! 🧪

Writing tests is not an afterthought—it is core to engineering excellence at OnboardPro. In this module, you will learn to write isolated unit tests, manage test doubles, and apply the **Red-Green-Refactor** loop.`,
      },
      {
        id: 'objectives',
        title: '2. Learning Objectives',
        type: 'objectives',
        duration: '10 mins',
        content: `### 🎯 Objectives:
1. Apply the AAA (Arrange, Act, Assert) pattern.
2. Practice Red-Green-Refactor TDD.
3. Master mocks, stubs, and spies in Vitest/Jest.
4. Maintain 80%+ branch coverage on PRs.`,
      },
      {
        id: 'resource',
        title: '3. Video: Test-Driven Development in Practice',
        type: 'resource',
        duration: '35 mins',
        videoTitle: 'TDD Red-Green-Refactor Workflow and Effective Mocking',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        content: `Key principles: Fast, Independent, Repeatable, Self-validating, Timely (FIRST).`,
      },
      {
        id: 'docs',
        title: '4. Testing Guide & Assertion Standards',
        type: 'docs',
        duration: '25 mins',
        content: `### AAA Pattern Example:

\`\`\`typescript
describe('UserService.calculateOnboardingProgress', () => {
  it('should return 100% when all mandatory modules are completed', () => {
    // 1. Arrange
    const modules = [{ id: '1', mandatory: true, status: 'completed' }];
    
    // 2. Act
    const progress = calculateProgress(modules);
    
    // 3. Assert
    expect(progress).toBe(100);
  });
});
\`\`\``,
      },
      {
        id: 'task',
        title: '5. Practical Hands-on Tasks',
        type: 'task',
        duration: '40 mins',
        content: 'Complete test suite exercises:',
        tasks: [
          {
            id: 'task-1',
            title: 'Write Unit Tests for Auth Validator',
            description: 'Write test cases covering valid emails, passwords, and SQL injection sanitization.',
            codeSnippet: `npm run test auth.validator.test.ts`,
            isCompleted: false,
          },
          {
            id: 'task-2',
            title: 'Implement Mock for External Payment Gateway',
            description: 'Use Vitest vi.fn() or vi.spyOn() to mock network calls in invoice processing.',
            codeSnippet: `const mockApi = vi.fn().mockResolvedValue({ status: 200 });`,
            isCompleted: false,
          },
        ],
      },
      {
        id: 'quiz',
        title: '6. Knowledge Check Quiz',
        type: 'quiz',
        duration: '15 mins',
        quizQuestions: [
          {
            id: 'qt1',
            question: 'What is the primary objective of the Red phase in TDD?',
            options: [
              'Delete code that produces compiler errors.',
              'Write a test that fails before writing any implementation code to confirm test validity.',
              'Check Git commit logs.',
              'Deploy code to staging.',
            ],
            correctIndex: 1,
            explanation: 'Writing a failing test first ensures that the test is actually evaluating the expected new capability.',
          },
        ],
      },
      {
        id: 'assessment',
        title: '7. Final Assessment',
        type: 'assessment',
        duration: '15 mins',
        content: `### 🎓 Take Unit Testing & TDD Assessment
- **Passing Score**: 75%
- **Questions**: 6 questions
- **Reward**: 200 XP + **Testing Pro** Badge`,
      },
    ],
  },
};
