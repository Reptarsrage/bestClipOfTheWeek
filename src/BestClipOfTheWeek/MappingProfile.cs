using AutoMapper;
using BestClipOfTheWeek.Models;
using BestClipOfTheWeek.Models.Terms;

namespace BestClipOfTheWeek
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Term, TermViewModel>();

            CreateMap<TermViewModel, Term>();
        }
    }
}
