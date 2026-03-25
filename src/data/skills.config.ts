//home (termux)/arclune_lane_7x3/src/data/skills.config.ts

/**
 * skills.config chỉ giữ phần override/metadata đặc thù.
 * Dữ liệu kit chuẩn mặc định được lấy từ `ROSTER` trong `src/catalog.ts`
 * qua `buildBaseSkillSetsFromRoster()` (src/data/skills.ts).
 *
 * => Khi thêm unit mới (kể cả Prime), chỉ cần khai báo kit ở catalog.
 * Chỉ thêm record ở đây nếu muốn ghi đè skill text hoặc bổ sung notes/metadata riêng.
 */

const IDEA_SOURCE_REFS = [
  'ý tưởng nhân vật v1.txt',
  'ý tưởng nhân vật v2.3.txt',
  'ý tưởng nhân vật 3.2.txt'
] as const;

const skillsConfig = [
  {
    unitId: 'thien_luu',
    designStatus: 'placeholder',
    placeholderControl: {
      allowSyntheticFill: false,
      requiredSourceFiles: IDEA_SOURCE_REFS
    },
    notes: [
      'missing design source: chưa tìm thấy mô tả kit của Thiên Lưu trong bộ tài liệu v1/v2.3/3.2.',
      'Giữ record tạm để tránh trống dữ liệu im lặng; cần bổ sung basic/skills/ult/talent khi có nguồn thiết kế chính thức.'
    ]
  }
] as const;

export default skillsConfig;