import { ROSTER } from '../catalog.js';

function deepFreeze(value){
  if (Array.isArray(value)){
    value.forEach(deepFreeze);
    return Object.freeze(value);
  }
  if (value && typeof value === 'object'){
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
  }
  return value;
}

function normalizeSection(section){
  if (!section) return null;
  if (typeof section === 'string'){
    return { name: '', description: section };
  }
  const normalized = { ...section };
  if (Array.isArray(section.tags)){
    normalized.tags = [...section.tags];
  }
  if (Array.isArray(section.notes)){
    normalized.notes = [...section.notes];
  }
  if (section.notes && !Array.isArray(section.notes)){
    normalized.notes = [section.notes];
  }
  return normalized;
}

function normalizeSkillEntry(entry){
  if (!entry) return null;
  const normalized = { ...entry };
  if (Array.isArray(entry.tags)){
    normalized.tags = [...entry.tags];
  }
  if (entry.cost && typeof entry.cost === 'object'){
    normalized.cost = { ...entry.cost };
  }
  if (Array.isArray(entry.notes)){
    normalized.notes = [...entry.notes];
  }
  if (entry.notes && !Array.isArray(entry.notes)){
    normalized.notes = [entry.notes];
  }
  return normalized;
}

const rawSkillSets = [
  {
    unitId: 'phe',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      description: 'Gây sát thương theo n% WIL + x% ATK lên một mục tiêu và hồi lại cho bản thân HP = 10% lượng sát thương vừa gây ra.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Song Huyết Cầu',
        type: 'active',
        cost: { aether: 25 },
        description: 'Phóng hai huyết cầu vào hai kẻ địch ngẫu nhiên. Mỗi cú đánh gây 150% sát thương đòn đánh thường và được tính như đòn đánh thường để tương tác với hiệu ứng liên quan.'
      },
      {
        key: 'skill2',
        name: 'Huyết Chướng',
        type: 'active',
        cost: { aether: 25 },
        duration: '2 lượt',
        description: 'Trong 2 lượt, mọi sát thương Phệ gây ra giảm 30% và hắn trở nên không thể bị chỉ định bởi các đòn đánh đơn mục tiêu. Đồng thời hồi 15% Máu tối đa mỗi lượt (tổng cộng 30%).'
      },
      {
        key: 'skill3',
        name: 'Huyết Thệ',
        type: 'active',
        cost: { aether: 40 },
        duration: '5 lượt',
        description: 'Liên kết thanh HP với một đơn vị ngẫu nhiên (có thể là Leader). Trong thời gian hiệu lực, 50% sát thương kẻ đó phải chịu sẽ chuyển sang Phệ. Chỉ duy trì tối đa một mối liên kết cùng lúc.'
      }
    ],
    ult: {
      name: 'Thiên Mệnh Phệ Nguyên Kinh',
      type: 'ultimate',
      duration: '2 lượt (buff WIL)',
      description: 'Hút máu toàn bộ kẻ địch: mỗi mục tiêu mất 7% HP hiện tại của chính chúng + 80% WIL của Phệ (sát thương Thuật, không thể né, RES vẫn giảm). Tổng lượng hút hồi cho Phệ 40% và hồi cho hai đồng minh ngẫu nhiên mỗi người 30%. Phần hồi vượt Max HP chuyển thành Giáp Máu tới tối đa 100% Max HP. Sau khi thi triển nhận thêm 20% WIL trong 2 lượt và để lại 1 Phệ Ấn lên mỗi mục tiêu bị hút.'
    },
    talent: {
      name: 'Phệ Ấn',
      type: 'talent',
      description: 'Mỗi đòn đánh thường/skill/ultimate trúng mục tiêu đặt 1 Phệ Ấn. Khi đủ 3 cộng dồn, Phệ Ấn tự kích nổ trong lượt của mục tiêu, gây sát thương bằng 50% WIL của Phệ. Dấu ấn tồn tại tối đa 3 lượt nếu không được làm mới. Không thể bị xoá bỏ, lãng quên hoặc cướp. Chúc Phúc Của Huyết Chủ: Phệ khi vào trận +15% Máu tối đa và +50% HP regen.'
    },
    technique: null,
    notes: [
      'Song Huyết Cầu và mọi hit từ tuyệt kỹ đều được tính như đòn đánh thường để hưởng hiệu ứng liên quan.',
      'Huyết Thệ chuyển hướng sát thương nhưng vẫn khiến Phệ chịu đòn nên cần quản lý lượng hồi máu từ bộ kỹ năng.'
    ]
  },
  {
    unitId: 'kiemtruongda',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      description: 'Chém một mục tiêu bằng n% ATK + x% WIL, đồng thời áp dụng hiệu ứng Xuyên Giáp khiến đòn đánh bỏ qua 5% ARM và RES của mục tiêu. Hiệu ứng cộng dồn với skill/ultimate.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Loạn Trảm Dạ Hành',
        type: 'active',
        cost: { aether: 25 },
        description: 'Gây sát thương bằng 150% đòn đánh thường lên một hàng ngang ngẫu nhiên (1-2-3 hoặc 4-5-6 hoặc 7-8-9). Được tính là đòn đánh thường để kích hoạt hiệu ứng tương ứng.'
      },
      {
        key: 'skill2',
        name: 'Ngũ Kiếm Huyền Ấn',
        type: 'active',
        cost: { aether: 20 },
        description: 'Kích hoạt ngẫu nhiên một trong năm kiếm trạng thái cho tới hết trận: Kiếm Sinh (hồi HP = 5% tổng sát thương gây ra), Kiếm Ma (bỏ qua thêm 10% ARM/RES của mục tiêu), Kiếm Thổ (+5% ARM/RES bản thân), Kiếm Hỏa (+5% tổng sát thương gây ra), Kiếm Hư (+15% tỉ lệ tránh đòn đánh thường). Chỉ sở hữu một trạng thái kiếm mỗi trận.'
      },
      {
        key: 'skill3',
        name: 'Kiếm Ý Tinh Luyện',
        type: 'active',
        cost: { aether: 25 },
        duration: '3 lượt (bắt đầu từ lượt kế tiếp)',
        description: 'Cường hóa bản thân thêm 20% ATK/WIL hiện có. Hiệu ứng bắt đầu tính từ lượt kế tiếp sau khi thi triển.'
      }
    ],
    ult: {
      name: 'Vạn Kiếm Quy Tông',
      type: 'ultimate',
      description: 'Phóng thích 4 nhát chém dọc cột giữa hướng Leader địch (ô 2-5-8). Mỗi hit gây 80% sát thương đòn đánh thường (lai vật lý/thuật), xuyên 30% RES và được tính là đòn đánh thường. Nếu mục tiêu né đòn đánh thường, hit tương ứng sẽ trượt.'
    },
    talent: {
      name: 'Kiếm Tâm',
      type: 'talent',
      description: 'Mỗi lần thi triển tuyệt kỹ thành công, Kiếm Trường Dạ nhận vĩnh viễn +5% ATK/WIL dựa trên chỉ số ban đầu khi vào trận. Hiệu ứng tích lũy không giới hạn và không thể bị xoá hoặc cướp.'
    },
    technique: null,
    notes: [
      'Các hit từ tuyệt kỹ được tính riêng rẽ giúp tận dụng hiệu ứng đòn đánh thường và cộng dồn Xuyên Giáp.',
      'Ngũ Kiếm Huyền Ấn cần hiệu ứng hình ảnh để người chơi nhận biết trạng thái hiện tại.'
    ]
  },
  {
    unitId: 'loithienanh',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      description: 'Ra hai cú đấm liên tiếp vào một mục tiêu: hit đầu gây sát thương bằng n% ATK + x% WIL, hit thứ hai gây thêm 50% sát thương của hit đầu. Mỗi hit giảm 2% SPD của mục tiêu (tối đa 5 cộng dồn) và hiệu ứng chỉ biến mất khi bị xoá.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Lôi Ảnh Tam Kích',
        type: 'active',
        cost: { aether: 25 },
        description: 'Giương tay thu lôi đánh ngẫu nhiên ba kẻ địch, mỗi mục tiêu nhận sát thương bằng 110% đòn đánh thường. Nếu cả ba mục tiêu đứng liền kề nhau, chúng chịu thêm 10% sát thương.'
      },
      {
        key: 'skill2',
        name: 'Ngũ Lôi Phệ Thân',
        type: 'active',
        cost: { aether: 35, hpPercent: 0.05 },
        description: 'Thiêu đốt 5% Máu tối đa của bản thân rồi gọi 5 lôi cầu tấn công ngẫu nhiên 5 kẻ địch. Mỗi cầu gây 130% sát thương đòn đánh thường, không tính là đòn đánh thường.'
      },
      {
        key: 'skill3',
        name: 'Lôi Thể Bách Chiến',
        type: 'active',
        cost: { aether: 30 },
        description: 'Tăng 20% Máu tối đa (dựa trên giá trị gốc khi vào trận). Sau khi dùng 3 lần, kỹ năng bị khoá cho tới hết trận.'
      }
    ],
    ult: {
      name: 'Huyết Hồn Lôi Quyết',
      type: 'ultimate',
      duration: '2 lượt',
      description: 'Thiêu đốt 15% Máu tối đa (không làm giảm ngưỡng Max HP, không thể tự sát, tối thiểu còn 1 HP) rồi gây sát thương Thuật bằng 7% Max HP mục tiêu (4% với boss PvE) + 50% WIL lên 3 kẻ địch ngẫu nhiên. Mỗi hit được tính là đòn đánh thường và áp dụng giảm 2% SPD lên mục tiêu trúng đòn. Sau khi thi triển nhận -30% sát thương phải chịu trong 2 lượt.'
    },
    talent: {
      name: 'Song Thể Lôi Đạo',
      type: 'talent',
      description: 'Khi HP ≥ 50%, Lôi Thiên Ảnh nhận +20% ARM/RES. Khi HP ≤ 49%, chuyển sang +20% WIL/ATK. Hiệu ứng luôn hoạt động, không thể bị xoá hoặc lãng quên.'
    },
    technique: null,
    notes: [
      'Các kỹ năng tiêu hao HP không thể khiến nhân vật tự sát.',
      'Giảm SPD từ đòn đánh thường cũng áp dụng lên các hit của tuyệt kỹ.'
    ]
  },
  {
    unitId: 'laky',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      description: 'Gây sát thương bằng n% WIL + x% ATK lên một mục tiêu và cộng một tầng "Mê Hoặc". Khi mục tiêu đạt 4 tầng sẽ ngủ trong 1 lượt; các tầng sau đó đặt lại. Hiệu ứng không thể bị xoá trước khi kích hoạt.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Mộng Trảo',
        type: 'active',
        cost: { aether: 25 },
        description: 'Gây ba đòn tấn công diện rộng ngẫu nhiên, mỗi đòn gây 130% sát thương đòn đánh thường.'
      },
      {
        key: 'skill2',
        name: 'Vạn Mộng Trận',
        type: 'active',
        cost: { aether: 35 },
        description: 'Gây năm đòn diện rộng ngẫu nhiên, mỗi đòn gây 100% sát thương đòn đánh thường.'
      },
      {
        key: 'skill3',
        name: 'Mộng Giới Hộ Thân',
        type: 'active',
        cost: { aether: 20 },
        duration: '3 lượt',
        description: 'Giảm 20% mọi sát thương phải chịu trong 3 lượt.'
      }
    ],
    ult: {
      name: 'Đại Mộng Thiên Thu',
      type: 'ultimate',
      duration: '2 lượt',
      description: 'Gây trạng thái Ngủ lên ba kẻ địch ngẫu nhiên trong 2 lượt: mục tiêu không hành động, không thể né/đỡ/parry nhưng vẫn nhận sát thương đầy đủ. Boss PvE chỉ ngủ nửa thời gian (làm tròn xuống).'
    },
    talent: {
      name: 'Mê Mộng Chú',
      type: 'talent',
      description: 'Nhận +2% RES cho mỗi kẻ địch đang ngủ. Hiệu ứng cộng dồn không giới hạn, luôn hoạt động và không thể bị xoá.'
    },
    technique: null,
    notes: [
      'Hiệu ứng Mê Hoặc không tự biến mất; sau khi kích hoạt ngủ sẽ đặt lại số tầng về 0.',
      'Có thể hỗ trợ đồng đội khống chế bằng cách chuẩn bị sẵn tầng Mê Hoặc trước khi dùng tuyệt kỹ.'
    ]
  },
  {
    unitId: 'doanminh',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      description: 'Gây sát thương bằng n% WIL + x% ATK lên một mục tiêu.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Cán Cân Giáng Phạt',
        type: 'active',
        cost: { aether: 20 },
        description: 'Dùng cán cân nện vào một kẻ địch, gây 150% sát thương đòn đánh thường.'
      },
      {
        key: 'skill2',
        name: 'Phán Xét Cứu Rỗi',
        type: 'active',
        cost: { aether: 15 },
        description: 'Hồi phục cho ba đồng minh ngẫu nhiên, mỗi người nhận lượng HP bằng 10% Máu tối đa của Doãn Minh.'
      },
      {
        key: 'skill3',
        name: 'Cân Bằng Sinh Mệnh',
        type: 'active',
        cost: { aether: 15 },
        description: 'Tăng 10% Máu tối đa của bản thân dựa trên giá trị gốc khi vào trận. Có thể sử dụng tối đa 5 lần trong một trận.'
      }
    ],
    ult: {
      name: 'Cán Cân Công Lý',
      type: 'ultimate',
      description: 'Chọn ngẫu nhiên ba đồng minh (trừ Leader) còn sống và cân bằng lượng HP của họ về cùng một mức trung bình (không vượt quá Máu tối đa). Đồng thời hồi cho Leader 10% Máu tối đa của Doãn Minh.'
    },
    talent: {
      name: 'Thăng Bình Pháp Lực',
      type: 'talent',
      description: 'Khi ra sân, hồi HP cho toàn bộ đồng minh trên sân bằng 5% Máu tối đa của Doãn Minh.'
    },
    technique: null,
    notes: [
      'Cân bằng HP từ tuyệt kỹ không làm mất phần máu vượt ngưỡng hiện có của các mục tiêu khác.',
      'Nội tại kích hoạt cả khi được triệu hồi lại sau khi rời sân.'
    ]
  },
  {
    unitId: 'kydieu',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      description: 'Gây sát thương bằng n% ATK + x% WIL lên một mục tiêu.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Tế Lễ Phản Hồn',
        type: 'active',
        cost: { aether: 20 },
        duration: '3 lượt',
        description: 'Hồi phục cho bản thân 8% Máu tối đa mỗi lượt trong 3 lượt.'
      },
      {
        key: 'skill2',
        name: 'Thí Thân Hộ Chủ',
        type: 'active',
        cost: { aether: 15 },
        description: 'Hy sinh bản thân (HP về 0) để ban cho Leader một tầng Bất Khuất. Sau 4 lượt, Kỳ Diêu hồi sinh ngẫu nhiên trên sân với 0 Aether, 50% nộ tối đa và 50% HP tối đa. Nếu sân đã kín, cô biến mất vĩnh viễn và không thể hồi sinh.'
      },
      {
        key: 'skill3',
        name: 'Tế Vũ Tăng Bão',
        type: 'active',
        cost: { aether: 20 },
        duration: '4 lượt',
        description: 'Tăng 50% tốc độ tích nộ cho bản thân trong 4 lượt.'
      }
    ],
    ult: {
      name: 'Hoàn Hồn Mộ Tặc',
      type: 'ultimate',
      description: 'Hồi sinh một đồng minh ngẫu nhiên (ưu tiên người vừa ngã xuống gần nhất). Khi sống lại, mục tiêu nhận lượng HP tối đa bằng 15% Máu tối đa của chính họ (giới hạn trên là giá trị đó), nộ về 0 và bị khoá kỹ năng trong 1 lượt.'
    },
    talent: {
      name: 'Phục Tế Khôi Minh',
      type: 'talent',
      description: 'Mỗi lượt hành động thành công cộng vĩnh viễn +3% ARM và +3% RES. Hiệu ứng không giới hạn cộng dồn và không thể bị xoá hoặc cướp.'
    },
    technique: null,
    notes: [
      'Thí Thân Hộ Chủ có thể kết hợp với nội tại để tích phòng thủ trước khi tự hiến.',
      'Khi hồi sinh do tuyệt kỹ, đồng minh sẽ không được nhận lại Aether và phải chờ 1 lượt mới có thể dùng kỹ năng.'
    ]
  },
  {
    unitId: 'tranquat',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      description: 'Gây sát thương bằng n% ATK + x% WIL lên một mục tiêu.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Sai Khiển Tiểu Đệ',
        type: 'active',
        cost: { aether: 15 },
        description: 'Sai khiến hai tiểu đệ hiện có tấn công một kẻ địch bằng đòn đánh thường của chúng.'
      },
      {
        key: 'skill2',
        name: 'Khiên Mộc Dẫn Địch',
        type: 'active',
        cost: { aether: 20 },
        duration: '3 lượt',
        description: 'Đặt hiệu ứng Khiêu Khích lên toàn bộ tiểu đệ còn sống trên sân trong 3 lượt.'
      },
      {
        key: 'skill3',
        name: 'Tăng Cường Tòng Bộc',
        type: 'active',
        cost: { aether: 20 },
        description: 'Tăng giới hạn HP/ATK/WIL mà tiểu đệ kế thừa từ Trần Quát thêm 20%. Hiệu ứng chỉ áp dụng cho các tiểu đệ được triệu hồi sau khi sử dụng và kỹ năng sẽ bị khoá sau 5 lần dùng.'
      }
    ],
    ult: {
      name: 'Gọi Tiểu Đệ',
      type: 'ultimate',
      description: 'Triệu hồi 2 tiểu đệ vào các ô trống lân cận cùng hàng. Mỗi tiểu đệ có HP/ATK/WIL bằng 50% chỉ số của Trần Quát (có thể tăng thêm nhờ Tăng Cường Tòng Bộc), tồn tại tối đa 4 lượt hoặc đến khi bị tiêu diệt. Chỉ duy trì tối đa 2 tiểu đệ cùng lúc; triệu hồi mới thay thế tiểu đệ tồn tại lâu nhất. Tiểu đệ không thể hồi sinh.'
    },
    talent: {
      name: 'Đại Ca Đầu Đàn',
      type: 'talent',
      description: 'Mỗi tiểu đệ hiện diện trên sân giúp Trần Quát nhận thêm 15% tổng sát thương đòn đánh thường. Khi một tiểu đệ bị kẻ thù hạ gục, Trần Quát nhận thêm 5% ATK/WIL (tối đa 3 lần).'
    },
    technique: null,
    notes: [
      'Các tiểu đệ được gọi bằng kỹ năng vẫn tuân theo giới hạn 2 đơn vị như trong tuyệt kỹ.',
      'Khi sử dụng Sai Khiển Tiểu Đệ, nếu không còn tiểu đệ nào trên sân thì kỹ năng sẽ không gây hiệu ứng.'
    ]
  },
  {
    unitId: 'linhgac',
    basic: {
      name: 'Đánh Thường',
      type: 'basic',
      description: 'Gây sát thương bằng n% ATK + x% WIL lên một mục tiêu.'
    },
    skills: [
      {
        key: 'skill1',
        name: 'Trảm Cảnh Giới',
        type: 'active',
        cost: { aether: 20 },
        description: 'Gây sát thương bằng 150% đòn đánh thường lên một mục tiêu.'
      },
      {
        key: 'skill2',
        name: 'Thành Lũy Tạm Thời',
        type: 'active',
        cost: { aether: 15 },
        duration: '3 lượt',
        description: 'Tăng 20% RES và ARM cho bản thân trong 3 lượt.'
      },
      {
        key: 'skill3',
        name: 'Kiên Cố Trường Kỳ',
        type: 'active',
        cost: { aether: 20 },
        description: 'Tăng 5% RES/ARM của bản thân cho đến hết trận. Khi HP dưới 30% Max HP, mỗi lần dùng kỹ năng này thay vì 5% sẽ tăng 15% RES/ARM.'
      }
    ],
    ult: {
      name: 'Còi Tăng Tốc',
      type: 'ultimate',
      duration: '2 lượt',
      description: 'Tăng 20% tốc đánh cho bản thân và hai đồng minh ngẫu nhiên trong 2 lượt. Trong thời gian này, đòn đánh thường của Lính Gác gây thêm 5% tổng sát thương.'
    },
    talent: {
      name: 'Cảnh Giới Bất Biến',
      type: 'talent',
      description: 'Khi vào trận nhận ngay +5% AGI và +5% ATK. Hiệu ứng luôn hoạt động trong suốt trận đấu.'
    },
    technique: null,
    notes: [
      'Kiên Cố Trường Kỳ giúp tích lũy phòng thủ cao hơn khi Lính Gác ở ngưỡng máu nguy hiểm.',
      'Còi Tăng Tốc ưu tiên đồng minh ngẫu nhiên; hiệu ứng có thể trùng lặp với các nguồn tăng tốc khác.'
    ]
  }
];

const SKILL_KEYS = ['basic', 'skill', 'skills', 'ult', 'talent', 'technique', 'notes'];

const skillSets = rawSkillSets.reduce((acc, entry) => {
  const skills = Array.isArray(entry.skills) ? entry.skills.map(normalizeSkillEntry) : [];
  const skill = entry.skill ? normalizeSkillEntry(entry.skill) : (skills[0] ?? null);
  const normalized = {
    unitId: entry.unitId,
    basic: normalizeSection(entry.basic),
    skill,
    skills,
    ult: normalizeSection(entry.ult),
    talent: normalizeSection(entry.talent),
    technique: normalizeSection(entry.technique),
    notes: Array.isArray(entry.notes) ? [...entry.notes] : (entry.notes ? [entry.notes] : [])
  };
  deepFreeze(normalized);
  acc[entry.unitId] = normalized;
  return acc;
}, {});

deepFreeze(skillSets);

export { skillSets };

export function getSkillSet(unitId){
  if (!unitId) return null;
  return skillSets[unitId] ?? null;
}

export function listSkillSets(){
  return ROSTER.map(unit => skillSets[unit.id]).filter(Boolean);
}

export function hasSkillSet(unitId){
  return unitId != null && Object.prototype.hasOwnProperty.call(skillSets, unitId);
}

export function validateSkillSetStructure(entry){
  if (!entry || typeof entry !== 'object') return false;
  for (const key of SKILL_KEYS){
    if (!(key in entry)){
      return false;
    }
  }
  if (!entry.unitId) return false;
  if (entry.skills && !Array.isArray(entry.skills)) return false;
  return true;
}
