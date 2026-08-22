# Issue tracker: GitHub

توجد المشكلات والمواصفات الخاصة بهذا المستودع في GitHub Issues. استخدم واجهة `gh` لجميع العمليات.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`.
- **Read an issue**: `gh issue view <number> --comments` مع جلب الوسوم.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments` مع مرشحات الحالة والوسم المناسبة.
- **Comment on an issue**: `gh issue comment <number> --body "..."`.
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` أو `--remove-label "..."`.
- **Close**: `gh issue close <number> --comment "..."`.

استنتج المستودع من المسار المحلي أو من `user_github`؛ لا تُنشأ تذاكر أو تعليقات خارجية إلا بطلب صريح من مالك المشروع.

## Pull requests as a triage surface

**PRs as a request surface: no.**

عند ذكر «النشر إلى متعقب المشكلات» داخل المهارات، أنشئ GitHub Issue فقط بعد موافقة صريحة من مالك المشروع.
