# Схема дата базы

## users
Сохранение всех юзеров: ученики, учителя, родители, админы

Поля:
- id
- name
- email # Опционально
- phone # Опционально
- password # hash
- role

## schools
Сохранение школ

Поля:
- id
- name

## classes
Сохранение классов

Поля:
- id
- letter
- number
- student_ids # массив
- school_id

## homework
Сохранение домашнего задания

Поля:
- id
- content
- type
- class_id
- teacher_id
- deadline # обычно до следуещего урока
- status # массив. айди учеников берет из класса

## grades
Сохранение отметок

Поля:
- id
- student_id
- homework_id
- lesson_id
- comment

## news
Новости школ

Поля:
- telegram_id #bot api
- school_id
- content
