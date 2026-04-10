import com.techquiz.dto.*;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionDTO {

    private Long id;
    private String logoUrl;

    // ✅ THIS IS THE MAIN FIX
    private List<String> options;

    private String difficulty;
}