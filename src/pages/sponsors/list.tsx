import { useGetSeasons } from "src/data/supabase/seasons.ts";
import usePersistedSeason from "src/hooks/usePersistedSeason.ts";
import {
  Box,
  Button,
  FormControl, FormControlLabel, Grid, IconButton,
  InputLabel,
  MenuItem, Paper,
  Select, Stack, styled,
  Switch, TextField,
  Typography
} from "@mui/material";
import {
  createFormHook,
  createFormHookContexts, useStore,
  uuid
} from "@tanstack/react-form";
import {
  ArrowDownward,
  ArrowUpward,
  ExpandLess,
  ExpandMore,
  KeyboardDoubleArrowDown,
  KeyboardDoubleArrowUp
} from "@mui/icons-material";

enum MoveRowOperation { Up, Down, First, Last }; 

type SponsorSlideType = "LogoAndTitle" | "FullscreenMedia" | "LocalEventSponsors";
type SponsorSlide = {
  name: string,
  uuid: string,
  isEnabled: boolean,
} & ({
  type: "LogoAndTitle",
  title: string,
  logoUrl: string
} | {
  type: "FullscreenMedia",
  mediaUrl: string
} | {
  type: SponsorSlideType
});

type SponsorSlideFormValue = SponsorSlide & {
  isExpanded: boolean
}

const { fieldContext, formContext } = createFormHookContexts();

const { useAppForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
})

const StrickenTypography = styled(Typography)(({theme}) => ({
  textDecoration: 'line-through',
  textDecorationColor: theme.palette.text.secondary,
}))

const SponsorSlideRow =  withFieldGroup({
  defaultValues: {} as SponsorSlideFormValue,
  props: {
    moveIndex: (_) => {},
  } as {
    moveIndex: (op: MoveRowOperation) => void,
    isFirst: boolean,
    isLast: boolean,
  },
  render: ({ group, moveIndex, isFirst, isLast }) => {
    // fun fact: don't use any standard react state in here unless you want it to stick
    // with the index not the actual item. tanstack form does weird stuff, it's easier to
    // just add stuff to the form value
    const slide = useStore(group.store, (state) => state.values);
    
    return (
      <Paper sx={{my: 1, p: 1}}>
        <Stack direction="row" justifyContent="start" alignItems="center">
          <Box sx={{ mr: 2 }}>
            <IconButton onClick={() => group.setFieldValue("isExpanded", (oldVal) => !oldVal)}>
              {slide.isExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          {slide.isExpanded ? 
          <Stack direction="row" gap={2} sx={{ mb: 3, flexGrow: 1 }}>
            <group.Field name={`name`}>
              {(subfield) => (
                <TextField label="Slide Name" sx={{width: "500px", maxWidth: "100%"}} value={subfield.state.value} onChange={(evt) => subfield.handleChange(evt.target.value)} />
              )}
            </group.Field>
            <group.Field name={`isEnabled`}>
              {(subfield) => (<>
                <FormControlLabel label="Enabled?" control={<Switch checked={subfield.state.value} onChange={(_, val) => subfield.handleChange(val)} />} />
              </>)}
            </group.Field>
          </Stack> : (slide.isEnabled ? <Typography sx={{ flexGrow: 1 }}>{slide.name}</Typography> : <StrickenTypography sx={{ flexGrow: 1 }}>{slide.name}</StrickenTypography>)}
          <Grid container spacing={2} columns={4} width={140}>
            <Grid size={1}>
              {!isFirst ? <IconButton size="small" onClick={() => {
                moveIndex(MoveRowOperation.First);
              }}><KeyboardDoubleArrowUp /></IconButton> : <div></div>}
            </Grid>
            <Grid size={1}>
              {!isFirst ? <IconButton size="small" onClick={() => {
                moveIndex(MoveRowOperation.Up);
              }}><ArrowUpward /></IconButton> : <div></div>}
            </Grid>
            <Grid size={1}>
              {!isLast ? <IconButton size="small" onClick={() => {
                moveIndex(MoveRowOperation.Down);
              }}><ArrowDownward /></IconButton> : <div></div>}
            </Grid>
            <Grid size={1}>
              {!isLast ? <IconButton size="small" onClick={() => {
                moveIndex(MoveRowOperation.Last);
              }}><KeyboardDoubleArrowDown /></IconButton> : <div></div>}
            </Grid>
          </Grid>
        </Stack>
  
        {slide.isExpanded && <>
          {slide.type === "LogoAndTitle" && <>
            <FormControl sx={{ display: 'block', mb: 2 }}>
              <group.Field name={`title`}>
                {(subfield) => (<>
                  <TextField label="Title" fullWidth value={subfield.state.value} onChange={(evt) => subfield.handleChange(evt.target.value)} />
                </>)}
              </group.Field>
            </FormControl>
            <FormControl sx={{ display: 'block', mb: 2 }}>
              <group.Field name={`logoUrl`}>
                {(subfield) => (<>
                  <TextField label="TMP: Logo URL" fullWidth value={subfield.state.value} onChange={(evt) => subfield.handleChange(evt.target.value)} />
                  <Box sx={{maxWidth: '100%', width: '300px', background: 'white', p: 2, m: 2}}>
                    <img width="100%" src={!subfield.state.value ? undefined : subfield.state.value} alt="Sponsor logo" />
                  </Box>
                </>)}
              </group.Field>
            </FormControl>
          </>}
          {slide.type === "FullscreenMedia" && <>
            <FormControl sx={{ display: 'block', mb: 2 }}>
              <group.Field name={`mediaUrl`}>
                {(subfield) => (<>
                  <TextField label="TMP: Media URL" fullWidth value={subfield.state.value} onChange={(evt) => subfield.handleChange(evt.target.value)} />
                </>)}
              </group.Field>
            </FormControl>
          </>}
          {slide.type === "LocalEventSponsors" && <>
            <Typography>At this point in the rotation, all local sponsors will be shown</Typography>
          </>}
        </>}
      </Paper>
    );
}});

function SponsorsList() {
  const getSeasonsQuery = useGetSeasons();
  const [selectedSeason, setSelectedSeason] = usePersistedSeason();
  const form = useAppForm({
    onSubmit: ({ value }) => {
      // TODO: Implement persistence
      console.log(value);
    },
    defaultValues: {
      slides: [] as SponsorSlideFormValue[]
    }
  });
  
  return (<>
    <FormControl fullWidth sx={{mb: 2}}>
      <InputLabel id="seasonLabel">Season</InputLabel>
      <Select
        labelId="seasonLabel"
        value={getSeasonsQuery.data?.some(s => s.id == selectedSeason) ? selectedSeason : ''}
        label="Season"
        onChange={(e) => setSelectedSeason(e.target.value as (number | null))}
      >
        {(getSeasonsQuery.data ?? []).map(s => <MenuItem key={s.id} value={s.id}>{s.name} ({s.levels.name})</MenuItem>)}
      </Select>
    </FormControl>
    
    <form onSubmit={async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await form.handleSubmit(e); 
    }}>
      <form.Field name="slides" mode="array">
        {(field) => (<>
          {/* TODO: drag and drop reordering? too complex to deal with right now. */}
          {field.state.value.length === 0 && <Paper sx={{ my: 1, p: 1 }}>
              <Typography>No slides found</Typography>
              </Paper>}
          {field.state.value.map((_, idx) => (
              <SponsorSlideRow
                key={idx}
                form={form}
                fields={`slides[${idx}]`}
                isFirst={idx === 0}
                isLast={idx === field.state.value.length - 1}
                moveIndex={(op) => {
                  let newIdx = idx;
                  if (op === MoveRowOperation.First) newIdx = 0;
                  else if (op === MoveRowOperation.Last) newIdx = field.state.value.length - 1;
                  else if (op === MoveRowOperation.Up) newIdx = idx - 1;
                  else if (op === MoveRowOperation.Down) newIdx = idx + 1;
                  form.moveFieldValues('slides', idx, newIdx)
                }} />
            ))}
        </>)}
      </form.Field>
      
      <Button onClick={() => {
        form.pushFieldValue("slides", {
          uuid: uuid(),
          type: "LocalEventSponsors",
          isEnabled: true,
          isExpanded: true
        } as SponsorSlideFormValue);
      }}>Add</Button>
      <Button type="submit">Save</Button>
    </form>
  </>);
}

export default SponsorsList;